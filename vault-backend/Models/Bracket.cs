using System.ComponentModel.DataAnnotations;

namespace VaultBackend.Models
{
    public class Bracket
    {
        [Key]
        public int BracketId { get; set; }
        public int TournamentId { get; set; }
        public int TotalRounds { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        // Navigation
        public Tournament Tournament { get; set; } = null!;
        public ICollection<Match> Matches { get; set; } = new List<Match>();
    }
}
