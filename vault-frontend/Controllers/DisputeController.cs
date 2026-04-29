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
    [Route("api/disputes")]
    [Authorize]
    public class DisputeController : ControllerBase
    {
        private readonly AppDbContext _db;
        public DisputeController(AppDbContext db) { _db = db; }

        // POST: File a dispute
        [HttpPost]
        public async Task<IActionResult> FileDispute([FromBody] CreateDisputeDto dto)
        {
            var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)!.Value);

            var match = await _db.Matches.FindAsync(dto.MatchId);
            if (match == null)
                return NotFound(new { message = "Match not found" });

            if (match.Player1Id != userId && match.Player2Id != userId)
                return Forbid();

            var existing = await _db.Disputes
                .AnyAsync(d => d.MatchId == dto.MatchId && d.FiledByUserId == userId);
            if (existing)
                return BadRequest(new { message = "You already filed a dispute for this match" });

            var dispute = new Dispute
            {
                MatchId = dto.MatchId,
                FiledByUserId = userId,
                Reason = dto.Reason,
                EvidenceUrl = dto.EvidenceUrl ?? string.Empty,
                Status = DisputeStatus.Open
            };

            // Freeze the match
            match.Status = MatchStatus.Disputed;

            _db.Disputes.Add(dispute);
            await _db.SaveChangesAsync();

            return StatusCode(201, new
            {
                message = "Dispute filed successfully. Match has been frozen pending review.",
                disputeId = dispute.DisputeId
            });
        }

        // GET: Get all disputes (Admin/Organizer only)
        [HttpGet]
        [Authorize(Roles = "Organizer,Admin")]
        public async Task<IActionResult> GetAll()
        {
            var disputes = await _db.Disputes
                .Include(d => d.FiledBy)
                .Include(d => d.Match)
                .Select(d => new DisputeResponseDto
                {
                    DisputeId = d.DisputeId,
                    MatchId = d.MatchId,
                    FiledByUsername = d.FiledBy.Username,
                    Reason = d.Reason,
                    EvidenceUrl = d.EvidenceUrl,
                    Status = d.Status.ToString(),
                    Resolution = d.Resolution,
                    CreatedAt = d.CreatedAt
                })
                .ToListAsync();

            return Ok(disputes);
        }

        // PUT: Resolve a dispute (Admin/Organizer only)
        [HttpPut("{disputeId}/resolve")]
        [Authorize(Roles = "Organizer,Admin")]
        public async Task<IActionResult> ResolveDispute(int disputeId, [FromBody] ResolveDisputeDto dto)
        {
            var dispute = await _db.Disputes
                .Include(d => d.Match)
                .FirstOrDefaultAsync(d => d.DisputeId == disputeId);

            if (dispute == null)
                return NotFound(new { message = "Dispute not found" });

            dispute.Status = DisputeStatus.Resolved;
            dispute.Resolution = dto.Resolution;
            dispute.Match.Status = MatchStatus.Completed;
            dispute.Match.WinnerId = dto.WinnerId;

            // Advance winner to next match
            if (dispute.Match.NextMatchId.HasValue)
            {
                var nextMatch = await _db.Matches.FindAsync(dispute.Match.NextMatchId.Value);
                if (nextMatch != null)
                {
                    if (nextMatch.Player1Id == null)
                        nextMatch.Player1Id = dto.WinnerId;
                    else
                        nextMatch.Player2Id = dto.WinnerId;
                }
            }

            await _db.SaveChangesAsync();
            return Ok(new { message = "Dispute resolved. Winner advanced." });
        }
    }
}