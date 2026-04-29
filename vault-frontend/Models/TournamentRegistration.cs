using System.ComponentModel.DataAnnotations;

namespace VaultBackend.Models
{
    public class TournamentRegistration
    {
        [Key]
        public int RegistrationId { get; set; }
        public int TournamentId { get; set; }
        public int UserId { get; set; }
        public DateTime RegisteredAt { get; set; } = DateTime.UtcNow;
        public string RankAtRegistration { get; set; } = string.Empty;
        public Tournament Tournament { get; set; } = null!;
        public User User { get; set; } = null!;
    }
}