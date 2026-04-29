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
    [Route("api/users")]
    [Authorize]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _db;

        public UsersController(AppDbContext db) { _db = db; }

        [HttpGet("profile")]
        public async Task<IActionResult> GetProfile()
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _db.Users
                .Include(u => u.Wallet)
                .FirstOrDefaultAsync(u => u.UserId == userId);

            if (user == null) return NotFound();

            var tournamentsPlayed = await _db.TournamentRegistrations
                .CountAsync(r => r.UserId == userId);

            return Ok(new
            {
                user.UserId, user.Username, user.Email,
                user.GameTag, user.City,
                Rank = user.Rank.ToString(),
                Role = user.Role.ToString(),
                user.Bio, user.CreatedAt,
                user.Institution,
                user.IsInstitutionVerified,
                user.CampusChampionCount,
                WalletBalance = user.Wallet?.Balance ?? 0,
                TournamentsPlayed = tournamentsPlayed,
            });
        }

        [HttpPut("profile")]
        public async Task<IActionResult> UpdateProfile([FromBody] UpdateProfileDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);
            var user = await _db.Users.FindAsync(userId);
            if (user == null) return NotFound();

            if (!string.IsNullOrEmpty(dto.Username)) user.Username = dto.Username;
            if (!string.IsNullOrEmpty(dto.GameTag)) user.GameTag = dto.GameTag;
            if (!string.IsNullOrEmpty(dto.City)) user.City = dto.City;
            if (!string.IsNullOrEmpty(dto.Bio)) user.Bio = dto.Bio;
            if (dto.Institution != null) user.Institution = dto.Institution;
            if (!string.IsNullOrEmpty(dto.Rank) && Enum.TryParse<PlayerRank>(dto.Rank, out var rank))
                user.Rank = rank;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Profile updated successfully" });
        }

        [HttpGet("leaderboard")]
        [AllowAnonymous]
        public async Task<IActionResult> GetLeaderboard([FromQuery] string? institution)
        {
            var usersQuery = _db.Users.AsQueryable();
            if (!string.IsNullOrEmpty(institution))
            {
                usersQuery = usersQuery.Where(u => u.Institution == institution);
            }
            
            var users = await usersQuery.ToListAsync();
            var matches = await _db.Matches.Where(m => m.WinnerId != null).ToListAsync();
            var registrations = await _db.TournamentRegistrations.ToListAsync();

            var leaderboard = users
                .Select(u => new
                {
                    u.UserId,
                    u.Username,
                    u.GameTag,
                    u.City,
                    u.Institution,
                    Rank = u.Rank.ToString(),
                    Role = u.Role.ToString(),
                    Wins = matches.Count(m => m.WinnerId == u.UserId),
                    Losses = matches.Count(m =>
                        (m.Player1Id == u.UserId || m.Player2Id == u.UserId) && m.WinnerId != u.UserId),
                    TournamentsPlayed = registrations.Count(r => r.UserId == u.UserId),
                })
                .Select(u => new
                {
                    u.UserId, u.Username, u.GameTag, u.City, u.Institution, u.Rank, u.Role,
                    u.Wins, u.Losses, u.TournamentsPlayed,
                    MatchesPlayed = u.Wins + u.Losses,
                    WinRate = (u.Wins + u.Losses) > 0
                        ? Math.Round((double)u.Wins / (u.Wins + u.Losses) * 100, 1) : 0,
                })
                .OrderByDescending(u => u.Wins)
                .ThenByDescending(u => u.WinRate)
                .Take(50)
                .ToList();

            return Ok(leaderboard);
        }

        [HttpGet("leaderboard/campuses")]
        [AllowAnonymous]
        public async Task<IActionResult> GetCampusesLeaderboard()
        {
            var matches = await _db.Matches.Where(m => m.WinnerId != null).ToListAsync();
            
            var campusRankings = await _db.Users
                .Where(u => !string.IsNullOrEmpty(u.Institution))
                .ToListAsync();

            var leaderboard = campusRankings
                .GroupBy(u => u.Institution)
                .Select(g => new
                {
                    Institution = g.Key,
                    TotalWins = g.Sum(u => matches.Count(m => m.WinnerId == u.UserId)),
                    TotalPlayers = g.Count(),
                    CampusChampions = g.Sum(u => u.CampusChampionCount)
                })
                .Where(c => c.TotalWins > 0 || c.CampusChampions > 0)
                .OrderByDescending(c => c.TotalWins)
                .ThenByDescending(c => c.CampusChampions)
                .Take(50)
                .ToList();

            return Ok(leaderboard);
        }
    }
}