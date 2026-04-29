using System.ComponentModel.DataAnnotations;

namespace VaultBackend.Models
{
    public enum TransactionType { EntryFee, PrizePayout, Refund, Deposit }

    public class Transaction
    {
        [Key]
        public int TransactionId { get; set; }
        public int WalletId { get; set; }
        public decimal Amount { get; set; }
        public TransactionType Type { get; set; }
        public string Description { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public Wallet Wallet { get; set; } = null!;
    }
}