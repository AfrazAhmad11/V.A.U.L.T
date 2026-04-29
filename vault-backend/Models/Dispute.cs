using System.ComponentModel.DataAnnotations;

namespace VaultBackend.Models
{
    public enum DisputeStatus { Open, Reviewing, Resolved, Dismissed }

    public class Dispute
    {
        [Key]
        public int DisputeId { get; set; }
        public int MatchId { get; set; }
        public int FiledByUserId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? EvidenceUrl { get; set; }
        public DisputeStatus Status { get; set; } = DisputeStatus.Open;
        public string? Resolution { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? ResolvedAt { get; set; }

        // Navigation
        public Match Match { get; set; } = null!;
        public User FiledBy { get; set; } = null!;
    }
}
