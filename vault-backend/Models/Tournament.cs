using System.ComponentModel.DataAnnotations;

namespace VaultBackend.Models
{
    public enum TournamentStatus { Open, FillingFast, Full, InProgress, Completed }

    public class Tournament
    {
        [Key]
        public int TournamentId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string GameTitle { get; set; } = string.Empty;
        public string GameTag { get; set; } = string.Empty;
        public decimal PrizePool { get; set; }
        public decimal EntryFee { get; set; }
        public int MaxSlots { get; set; }
        public int FilledSlots { get; set; } = 0;
        public string City { get; set; } = string.Empty;
        public TournamentStatus Status { get; set; } = TournamentStatus.Open;
        public string Rules { get; set; } = string.Empty;
        public string AccentColor { get; set; } = "#6C63FF";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsVerifiedCafe { get; set; } = false;
        public string? TargetInstitution { get; set; }
        public int OrganizerId { get; set; }
        public User Organizer { get; set; } = null!;
        public ICollection<TournamentRegistration> Registrations { get; set; } = new List<TournamentRegistration>();
    }
}