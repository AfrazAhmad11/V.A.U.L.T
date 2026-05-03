using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using VaultBackend.Data;
using VaultBackend.DTOs;
using VaultBackend.Models;
using VaultBackend.Services;

namespace VaultBackend.Controllers
{
    /// <summary>
    /// Handles user authentication and profile management.
    /// Supports registration, login, and session token generation.
    /// </summary>
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _db;
        private readonly JwtService _jwt;

        public AuthController(AppDbContext db, JwtService jwt)
        {
            _db = db;
            _jwt = jwt;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register([FromBody] RegisterDto dto)
        {
            // Check email exists
            if (await _db.Users.AnyAsync(u => u.Email == dto.Email))
                return Conflict(new { message = "Email already registered" });

            // Check username exists
            if (await _db.Users.AnyAsync(u => u.Username == dto.Username))
                return Conflict(new { message = "Username already taken" });

            // Parse rank
            if (!Enum.TryParse<PlayerRank>(dto.Rank, out var rank))
                rank = PlayerRank.Gold;

            // Create user
            var user = new User
            {
                Username = dto.Username,
                Email = dto.Email.ToLower(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password, 12),
                GameTag = dto.GameTag,
                City = dto.City,
                Rank = rank,
                Role = UserRole.Player,
                Institution = dto.Institution,
                IsInstitutionVerified = dto.Email.ToLower().EndsWith(".edu") || dto.Email.ToLower().EndsWith(".edu.pk")
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            // Create wallet for new user
            var wallet = new Wallet { UserId = user.UserId };
            _db.Wallets.Add(wallet);
            await _db.SaveChangesAsync();

            return StatusCode(201, new { message = "Account created successfully", userId = user.UserId });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginDto dto)
        {
            var user = await _db.Users
                .FirstOrDefaultAsync(u => u.Email == dto.Email.ToLower());

            if (user == null || !BCrypt.Net.BCrypt.Verify(dto.Password, user.PasswordHash))
                return Unauthorized(new { message = "Invalid email or password" });

            var token = _jwt.GenerateToken(user);

            return Ok(new AuthResponseDto
            {
                Token = token,
                UserId = user.UserId,
                Username = user.Username,
                Email = user.Email,
                Role = user.Role.ToString(),
                Rank = user.Rank.ToString(),
                City = user.City,
                GameTag = user.GameTag,
                Institution = user.Institution,
                IsInstitutionVerified = user.IsInstitutionVerified,
                CampusChampionCount = user.CampusChampionCount
            });
        }
    }
}
