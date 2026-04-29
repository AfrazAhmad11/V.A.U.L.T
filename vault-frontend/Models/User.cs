using System.ComponentModel.DataAnnotations;

namespace VaultBackend.Models
{
    public enum UserRole { Player, Organizer, Admin }
    public enum PlayerRank { Iron, Bronze, Silver, Gold, Platinum, Diamond, Ascendant, Immortal, Radiant }

    public class User
    {
        [Key]
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string PasswordHash { get; set; } = string.Empty;
        public string GameTag { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public PlayerRank Rank { get; set; } = PlayerRank.Gold;
        public UserRole Role { get; set; } = UserRole.Player;
        public string Bio { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public ICollection<Tournament> OrganizedTournaments { get; set; } = new List<Tournament>();
        public Wallet? Wallet { get; set; }
    }
}