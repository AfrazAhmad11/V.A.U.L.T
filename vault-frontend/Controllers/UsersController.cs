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
            if (!string.IsNullOrEmpty(dto.Rank) && Enum.TryParse<PlayerRank>(dto.Rank, out var rank))
                user.Rank = rank;

            await _db.SaveChangesAsync();
            return Ok(new { message = "Profile updated successfully" });
        }
    }
}