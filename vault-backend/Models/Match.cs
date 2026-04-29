using System.ComponentModel.DataAnnotations;

namespace VaultBackend.Models
{
    public enum MatchStatus { Pending, InProgress, Completed, Disputed }

    public class Match
    {
        [Key]
        public int MatchId { get; set; }
        public int BracketId { get; set; }
        public int Round { get; set; }          // 1 = first round, 2 = quarter, etc.
        public int MatchNumber { get; set; }    // Position within the round

        // Players (nullable — byes or not yet determined)
        public int? Player1Id { get; set; }
        public int? Player2Id { get; set; }
        public int? WinnerId { get; set; }

        // Scores
        public int? Player1Score { get; set; }
        public int? Player2Score { get; set; }

        // Status
        public MatchStatus Status { get; set; } = MatchStatus.Pending;

        // Links to next match (for bracket progression)
        public int? NextMatchId { get; set; }

        // Navigation
        public Bracket Bracket { get; set; } = null!;
        public User? Player1 { get; set; }
        public User? Player2 { get; set; }
        public User? Winner { get; set; }
        public Match? NextMatch { get; set; }
        public ICollection<Dispute> Disputes { get; set; } = new List<Dispute>();
    }
}
