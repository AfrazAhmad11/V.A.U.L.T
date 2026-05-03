using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using VaultBackend.Data;
using VaultBackend.DTOs;
using VaultBackend.Models;

namespace VaultBackend.Controllers
{
    /// <summary>
    /// Manages tournament lifecycle, registrations, and participant discovery.
    /// Supports both Global Open and University-exclusive formats.
    /// </summary>
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
                    IsVerifiedCafe = t.IsVerifiedCafe,
                    TargetInstitution = t.TargetInstitution,
                    OrganizerName = t.Organizer.Username,
                    OrganizerId = t.OrganizerId,
                    CreatedAt = t.CreatedAt,
                    StartsAt = t.StartsAt
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
                IsVerifiedCafe = t.IsVerifiedCafe,
                TargetInstitution = t.TargetInstitution,
                OrganizerName = t.Organizer.Username, OrganizerId = t.OrganizerId, CreatedAt = t.CreatedAt,
                StartsAt = t.StartsAt
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
                IsVerifiedCafe = dto.IsVerifiedCafe,
                TargetInstitution = string.IsNullOrEmpty(dto.TargetInstitution) ? null : dto.TargetInstitution,
                OrganizerId = userId,
                StartsAt = dto.StartsAt == default ? DateTime.UtcNow.AddDays(7) : dto.StartsAt
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

            var user = await _db.Users.FindAsync(userId);
            if (!string.IsNullOrEmpty(tournament.TargetInstitution))
            {
                if (user?.Institution != tournament.TargetInstitution)
                    return StatusCode(403, new { message = $"This is a University War exclusive to {tournament.TargetInstitution}." });
            }

            var alreadyJoined = await _db.TournamentRegistrations
                .AnyAsync(r => r.TournamentId == id && r.UserId == userId);
            if (alreadyJoined)
                return BadRequest(new { message = "Already joined this tournament" });

            // Wallet Escrow: Deduct entry fee
            if (tournament.EntryFee > 0)
            {
                var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.UserId == userId);
                if (wallet == null)
                    return BadRequest(new { message = "Wallet not found. Please contact support." });

                if (wallet.Balance < tournament.EntryFee)
                    return StatusCode(402, new { message = $"Insufficient funds. You need PKR {tournament.EntryFee:N0} but only have PKR {wallet.Balance:N0}. Please deposit funds first." });

                wallet.Balance -= tournament.EntryFee;
                _db.Transactions.Add(new Transaction
                {
                    WalletId = wallet.WalletId,
                    Amount = tournament.EntryFee,
                    Type = TransactionType.EntryFee,
                    Description = $"Entry fee for {tournament.Title}"
                });
            }

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

        // PUT: Edit tournament (Organizer only, not InProgress/Completed)
        [HttpPut("{id}")]
        [Authorize(Roles = "Organizer,Admin")]
        public async Task<IActionResult> Update(int id, [FromBody] CreateTournamentDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var tournament = await _db.Tournaments.FindAsync(id);
            if (tournament == null) return NotFound(new { message = "Tournament not found" });
            if (tournament.OrganizerId != userId) return Forbid();
            if (tournament.Status == TournamentStatus.InProgress || tournament.Status == TournamentStatus.Completed)
                return BadRequest(new { message = "Cannot edit a tournament that is in progress or completed" });

            tournament.Title = dto.Title;
            tournament.GameTitle = dto.GameTitle;
            tournament.GameTag = dto.GameTag;
            tournament.PrizePool = dto.PrizePool;
            tournament.EntryFee = dto.EntryFee;
            tournament.MaxSlots = dto.MaxSlots;
            tournament.City = dto.City;
            tournament.Rules = dto.Rules;
            tournament.IsVerifiedCafe = dto.IsVerifiedCafe;
            tournament.StartsAt = dto.StartsAt;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Tournament updated successfully" });
        }

        // DELETE: Delete tournament + auto-refund VP
        [HttpDelete("{id}")]
        [Authorize(Roles = "Organizer,Admin")]
        public async Task<IActionResult> Delete(int id)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var tournament = await _db.Tournaments.FindAsync(id);
            if (tournament == null) return NotFound(new { message = "Tournament not found" });
            if (tournament.OrganizerId != userId) return Forbid();
            if (tournament.Status == TournamentStatus.InProgress)
                return BadRequest(new { message = "Cannot delete a tournament in progress" });

            // Refund all entry fees as PKR
            if (tournament.EntryFee > 0)
            {
                var registrations = await _db.TournamentRegistrations
                    .Where(r => r.TournamentId == id).ToListAsync();
                foreach (var reg in registrations)
                {
                    var wallet = await _db.Wallets.FirstOrDefaultAsync(w => w.UserId == reg.UserId);
                    if (wallet != null)
                    {
                        wallet.Balance += tournament.EntryFee;
                        _db.Transactions.Add(new Transaction
                        {
                            WalletId = wallet.WalletId,
                            Amount = tournament.EntryFee,
                            Type = TransactionType.Refund,
                            Description = $"Refund: {tournament.Title} cancelled"
                        });
                    }
                }
            }

            // Cascade delete related data
            var regs = _db.TournamentRegistrations.Where(r => r.TournamentId == id);
            _db.TournamentRegistrations.RemoveRange(regs);
            var bracket = await _db.Brackets.FirstOrDefaultAsync(b => b.TournamentId == id);
            if (bracket != null)
            {
                var matches = _db.Matches.Where(m => m.BracketId == bracket.BracketId);
                var matchIds = await matches.Select(m => m.MatchId).ToListAsync();
                _db.Disputes.RemoveRange(_db.Disputes.Where(d => matchIds.Contains(d.MatchId)));
                _db.Matches.RemoveRange(matches);
                _db.Brackets.Remove(bracket);
            }
            _db.Tournaments.Remove(tournament);
            await _db.SaveChangesAsync();

            return Ok(new { message = "Tournament deleted. All entry fees refunded." });
        }

        /// <summary>
        /// Retrieves a unified list of players for a tournament.
        /// Uses aggressive discovery: pulls from both official registrations 
        /// and active bracket matches to ensure data consistency.
        /// </summary>
        [HttpGet("{id}/players")]
        public async Task<IActionResult> GetPlayers(int id)
        {
            // 1. Get official registrations
            var regs = await _db.TournamentRegistrations
                .Where(r => r.TournamentId == id)
                .Include(r => r.User)
                .Select(r => r.User)
                .ToListAsync();

            // 2. Get players from bracket matches (as fallback/supplement)
            var bracketPlayers = await _db.Matches
                .Where(m => m.Bracket.TournamentId == id)
                .Include(m => m.Player1)
                .Include(m => m.Player2)
                .SelectMany(m => new[] { m.Player1, m.Player2 })
                .Where(u => u != null)
                .ToListAsync();

            // 3. Merge and De-duplicate
            var allPlayers = regs.Concat(bracketPlayers)
                .Where(u => u != null)
                .GroupBy(u => u!.UserId)
                .Select(g => g.First())
                .Select(u => new {
                    u!.UserId,
                    u.Username,
                    u.GameTag,
                    Rank = u.Rank.ToString(),
                    u.Institution,
                    u.City,
                    RegisteredAt = DateTime.UtcNow // Meta info
                })
                .ToList();

            return Ok(allPlayers);
        }
    }
}