using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VaultBackend.Data;
using VaultBackend.DTOs;
using VaultBackend.Models;

namespace VaultBackend.Controllers
{
    [ApiController]
    [Route("api/matches")]
    [Authorize]
    public class MatchController : ControllerBase
    {
        private readonly AppDbContext _db;

        public MatchController(AppDbContext db) { _db = db; }

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

            await _db.SaveChangesAsync();

            return Ok(new { message = "Score reported! Winner advanced to next round.", winnerId });
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