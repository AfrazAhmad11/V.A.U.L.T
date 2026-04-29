using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VaultBackend.Data;
using VaultBackend.DTOs;
using VaultBackend.Models;

using Microsoft.AspNetCore.SignalR;
using VaultBackend.Hubs;

namespace VaultBackend.Controllers
{
    [ApiController]
    [Route("api/matches")]
    [Authorize]
    public class MatchController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly IHubContext<TournamentHub> _hubContext;

        public MatchController(AppDbContext db, IHubContext<TournamentHub> hubContext) 
        { 
            _db = db; 
            _hubContext = hubContext;
        }

        // POST: Report match score
        [HttpPost("{matchId}/report")]
        public async Task<IActionResult> ReportScore(int matchId, [FromBody] ReportMatchDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var match = await _db.Matches
                .Include(m => m.Bracket)
                .FirstOrDefaultAsync(m => m.MatchId == matchId);

            if (match == null)
                return NotFound(new { message = "Match not found" });

            if (match.Status == MatchStatus.Completed)
                return BadRequest(new { message = "Match already completed" });

            if (match.Player1Id != userId && match.Player2Id != userId)
                return Forbid();

            // Set scores
            match.Player1Score = dto.Player1Score;
            match.Player2Score = dto.Player2Score;

            // Determine winner
            int winnerId;
            if (dto.Player1Score > dto.Player2Score)
                winnerId = match.Player1Id!.Value;
            else if (dto.Player2Score > dto.Player1Score)
                winnerId = match.Player2Id!.Value;
            else
                return BadRequest(new { message = "Scores cannot be equal — there must be a winner" });

            match.WinnerId = winnerId;
            match.Status = MatchStatus.Completed;

            // Advance winner to next match
            if (match.NextMatchId.HasValue)
            {
                var nextMatch = await _db.Matches.FindAsync(match.NextMatchId.Value);
                if (nextMatch != null)
                {
                    if (nextMatch.Player1Id == null)
                        nextMatch.Player1Id = winnerId;
                    else
                        nextMatch.Player2Id = winnerId;
                }
            }
            else
            {
                // This is the FINAL match — champion crowned! Pay out prize pool.
                var tournament = await _db.Tournaments.FindAsync(match.Bracket.TournamentId);
                if (tournament != null)
                {
                    tournament.Status = TournamentStatus.Completed;

                    // Prize payout to winner's wallet
                    if (tournament.PrizePool > 0)
                    {
                        var winnerWallet = await _db.Wallets.FirstOrDefaultAsync(w => w.UserId == winnerId);
                        if (winnerWallet != null)
                        {
                            winnerWallet.Balance += tournament.PrizePool;
                            _db.Transactions.Add(new Transaction
                            {
                                WalletId = winnerWallet.WalletId,
                                Amount = tournament.PrizePool,
                                Type = TransactionType.PrizePayout,
                                Description = $"🏆 Won {tournament.Title} — Prize Pool Payout"
                            });
                        }
                    }

                    // Increment Campus Champion Count if University War
                    if (!string.IsNullOrEmpty(tournament.TargetInstitution))
                    {
                        var winner = await _db.Users.FindAsync(winnerId);
                        if (winner != null) winner.CampusChampionCount++;
                    }
                }
            }

            await _db.SaveChangesAsync();

            // Broadcast to SignalR group
            if (match.Bracket != null)
            {
                await _hubContext.Clients.Group(match.Bracket.TournamentId.ToString())
                    .SendAsync("MatchUpdated", matchId, winnerId);
            }

            var isFinal = !match.NextMatchId.HasValue;
            return Ok(new { message = isFinal ? "🏆 Tournament complete! Champion crowned!" : "Score reported! Winner advanced to next round.", winnerId, isFinal });
        }

        // GET: Get single match details
        [HttpGet("{matchId}")]
        public async Task<IActionResult> GetMatch(int matchId)
        {
            var match = await _db.Matches
                .Include(m => m.Player1)
                .Include(m => m.Player2)
                .Include(m => m.Winner)
                .FirstOrDefaultAsync(m => m.MatchId == matchId);

            if (match == null) return NotFound();

            return Ok(new MatchResponseDto
            {
                MatchId = match.MatchId,
                Round = match.Round,
                MatchNumber = match.MatchNumber,
                Player1Name = match.Player1?.Username ?? "TBD",
                Player2Name = match.Player2?.Username ?? "TBD",
                WinnerName = match.Winner?.Username,
                Player1Score = match.Player1Score,
                Player2Score = match.Player2Score,
                Status = match.Status.ToString(),
                NextMatchId = match.NextMatchId
            });
        }
    }
}