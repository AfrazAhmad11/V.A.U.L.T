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
    [Route("api/tournaments")]
    public class TournamentsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public TournamentsController(AppDbContext db) { _db = db; }

        // GET all tournaments (public)
        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] string? tag, [FromQuery] string? city)
        {
            var query = _db.Tournaments
                .Include(t => t.Organizer)
                .AsQueryable();

            if (!string.IsNullOrEmpty(tag))
                query = query.Where(t => t.GameTag == tag);
            if (!string.IsNullOrEmpty(city))
                query = query.Where(t => t.City == city);

            var tournaments = await query
                .OrderByDescending(t => t.CreatedAt)
                .Select(t => new TournamentResponseDto
                {
                    TournamentId = t.TournamentId,
                    Title = t.Title,
                    GameTitle = t.GameTitle,
                    GameTag = t.GameTag,
                    PrizePool = t.PrizePool,
                    EntryFee = t.EntryFee,
                    MaxSlots = t.MaxSlots,
                    FilledSlots = t.FilledSlots,
                    City = t.City,
                    Status = t.Status.ToString(),
                    Rules = t.Rules,
                    AccentColor = t.AccentColor,
                    OrganizerName = t.Organizer.Username,
                    CreatedAt = t.CreatedAt,
                })
                .ToListAsync();

            return Ok(tournaments);
        }

        // GET single tournament
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var t = await _db.Tournaments
                .Include(t => t.Organizer)
                .FirstOrDefaultAsync(t => t.TournamentId == id);

            if (t == null) return NotFound();

            return Ok(new TournamentResponseDto
            {
                TournamentId = t.TournamentId, Title = t.Title,
                GameTitle = t.GameTitle, GameTag = t.GameTag,
                PrizePool = t.PrizePool, EntryFee = t.EntryFee,
                MaxSlots = t.MaxSlots, FilledSlots = t.FilledSlots,
                City = t.City, Status = t.Status.ToString(),
                Rules = t.Rules, AccentColor = t.AccentColor,
                OrganizerName = t.Organizer.Username, CreatedAt = t.CreatedAt,
            });
        }

        // POST create tournament (Organizer only)
        [HttpPost]
        [Authorize(Roles = "Organizer,Admin")]
        public async Task<IActionResult> Create([FromBody] CreateTournamentDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var tournament = new Tournament
            {
                Title = dto.Title,
                GameTitle = dto.GameTitle,
                GameTag = dto.GameTag,
                PrizePool = dto.PrizePool,
                EntryFee = dto.EntryFee,
                MaxSlots = dto.MaxSlots,
                City = dto.City,
                Rules = dto.Rules,
                AccentColor = dto.AccentColor,
                OrganizerId = userId,
            };

            _db.Tournaments.Add(tournament);
            await _db.SaveChangesAsync();

            return StatusCode(201, new { message = "Tournament created", tournament.TournamentId });
        }

        // POST join tournament
        [HttpPost("{id}/join")]
        [Authorize]
        public async Task<IActionResult> Join(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var tournament = await _db.Tournaments.FindAsync(id);
            if (tournament == null) return NotFound();

            if (tournament.FilledSlots >= tournament.MaxSlots)
                return BadRequest(new { message = "Tournament is full" });

            var alreadyJoined = await _db.TournamentRegistrations
                .AnyAsync(r => r.TournamentId == id && r.UserId == userId);
            if (alreadyJoined)
                return BadRequest(new { message = "Already joined this tournament" });

            var user = await _db.Users.FindAsync(userId);

            var registration = new TournamentRegistration
            {
                TournamentId = id,
                UserId = userId,
                RankAtRegistration = user!.Rank.ToString(),
            };

            _db.TournamentRegistrations.Add(registration);
            tournament.FilledSlots++;

            if (tournament.FilledSlots >= tournament.MaxSlots)
                tournament.Status = TournamentStatus.Full;
            else if (tournament.FilledSlots >= tournament.MaxSlots * 0.75)
                tournament.Status = TournamentStatus.FillingFast;

            await _db.SaveChangesAsync();
            return StatusCode(201, new { message = "Successfully joined tournament!" });
        }
    }
}