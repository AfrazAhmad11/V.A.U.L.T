using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VaultBackend.Data;
using VaultBackend.DTOs;
using VaultBackend.Services;

namespace VaultBackend.Controllers
{
    [ApiController]
    [Route("api/brackets")]
    public class BracketController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly BracketService _bracketService;

        public BracketController(AppDbContext db, BracketService bracketService)
        {
            _db = db;
            _bracketService = bracketService;
        }

        // POST: Start tournament + generate bracket
        [HttpPost("generate/{tournamentId}")]
        [Authorize(Roles = "Organizer,Admin")]
        public async Task<IActionResult> GenerateBracket(int tournamentId)
        {
            var tournament = await _db.Tournaments.FindAsync(tournamentId);
            if (tournament == null)
                return NotFound(new { message = "Tournament not found" });

            var existingBracket = await _db.Brackets
                .FirstOrDefaultAsync(b => b.TournamentId == tournamentId);
            if (existingBracket != null)
                return BadRequest(new { message = "Bracket already generated for this tournament" });

            var registrations = await _db.TournamentRegistrations
                .CountAsync(r => r.TournamentId == tournamentId);
            if (registrations < 2)
                return BadRequest(new { message = "Need at least 2 players to generate bracket" });

            var bracket = await _bracketService.GenerateSingleEliminationBracket(tournamentId);

            tournament.Status = Models.TournamentStatus.InProgress;
            await _db.SaveChangesAsync();

            return StatusCode(201, new
            {
                message = "Bracket generated successfully!",
                bracketId = bracket.BracketId,
                totalRounds = bracket.TotalRounds
            });
        }

        // GET: Fetch full bracket with all matches
        [HttpGet("{tournamentId}")]
        public async Task<IActionResult> GetBracket(int tournamentId)
        {
            var bracket = await _db.Brackets
                .Include(b => b.Matches)
                    .ThenInclude(m => m.Player1)
                .Include(b => b.Matches)
                    .ThenInclude(m => m.Player2)
                .Include(b => b.Matches)
                    .ThenInclude(m => m.Winner)
                .FirstOrDefaultAsync(b => b.TournamentId == tournamentId);

            if (bracket == null)
                return NotFound(new { message = "Bracket not found. Tournament may not have started yet." });

            var players = await _db.TournamentRegistrations
                .Where(r => r.TournamentId == tournamentId)
                .Include(r => r.User)
                .Select(r => new TournamentPlayerDto
                {
                    UserId = r.User.UserId,
                    Username = r.User.Username,
                    GameTag = r.User.GameTag,
                    Rank = r.User.Rank.ToString(),
                    Institution = r.User.Institution,
                    City = r.User.City
                }).ToListAsync();

            var response = new BracketResponseDto
            {
                BracketId = bracket.BracketId,
                TournamentId = bracket.TournamentId,
                TotalRounds = bracket.TotalRounds,
                Players = players,
                Matches = bracket.Matches.OrderBy(m => m.Round).ThenBy(m => m.MatchNumber)
                    .Select(m => new MatchResponseDto
                    {
                        MatchId = m.MatchId,
                        Round = m.Round,
                        MatchNumber = m.MatchNumber,
                        Player1Id = m.Player1Id,
                        Player1Name = m.Player1?.Username ?? "TBD",
                        Player2Id = m.Player2Id,
                        Player2Name = m.Player2?.Username ?? "TBD",
                        WinnerId = m.WinnerId,
                        WinnerName = m.Winner?.Username,
                        Player1Score = m.Player1Score,
                        Player2Score = m.Player2Score,
                        Status = m.Status.ToString(),
                        NextMatchId = m.NextMatchId
                    }).ToList()
            };

            return Ok(response);
        }
    }
}