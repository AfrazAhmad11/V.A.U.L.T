using System.ComponentModel.DataAnnotations;

namespace VaultBackend.Models
{
    public class Wallet
    {
        [Key]
        public int WalletId { get; set; }
        public int UserId { get; set; }
        public decimal Balance { get; set; } = 0;
        public string Currency { get; set; } = "PKR";
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public User User { get; set; } = null!;
        public ICollection<Transaction> Transactions { get; set; } = new List<Transaction>();
    }
}