using Microsoft.EntityFrameworkCore;
using VaultBackend.Models;

namespace VaultBackend.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users { get; set; }
        public DbSet<Tournament> Tournaments { get; set; }
        public DbSet<TournamentRegistration> TournamentRegistrations { get; set; }
        public DbSet<Wallet> Wallets { get; set; }
        public DbSet<Transaction> Transactions { get; set; }
        public DbSet<Bracket> Brackets { get; set; }
        public DbSet<Match> Matches { get; set; }
        public DbSet<Dispute> Disputes { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // User
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<User>()
                .HasIndex(u => u.Username).IsUnique();

            // Tournament → Organizer
            modelBuilder.Entity<Tournament>()
                .HasOne(t => t.Organizer)
                .WithMany(u => u.OrganizedTournaments)
                .HasForeignKey(t => t.OrganizerId)
                .OnDelete(DeleteBehavior.Restrict);

            // TournamentRegistration
            modelBuilder.Entity<TournamentRegistration>()
                .HasOne(r => r.Tournament)
                .WithMany(t => t.Registrations)
                .HasForeignKey(r => r.TournamentId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<TournamentRegistration>()
                .HasOne(r => r.User)
                .WithMany()
                .HasForeignKey(r => r.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // Wallet → User (1-to-1)
            modelBuilder.Entity<Wallet>()
                .HasOne(w => w.User)
                .WithOne(u => u.Wallet)
                .HasForeignKey<Wallet>(w => w.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // ─── Bracket → Tournament (1-to-1) ───────────────
            modelBuilder.Entity<Bracket>()
                .HasOne(b => b.Tournament)
                .WithMany()
                .HasForeignKey(b => b.TournamentId)
                .OnDelete(DeleteBehavior.Cascade);

            // ─── Match → Bracket ──────────────────────────────
            modelBuilder.Entity<Match>()
                .HasOne(m => m.Bracket)
                .WithMany(b => b.Matches)
                .HasForeignKey(m => m.BracketId)
                .OnDelete(DeleteBehavior.Cascade);

            // Match → Player1
            modelBuilder.Entity<Match>()
                .HasOne(m => m.Player1)
                .WithMany()
                .HasForeignKey(m => m.Player1Id)
                .OnDelete(DeleteBehavior.Restrict);

            // Match → Player2
            modelBuilder.Entity<Match>()
                .HasOne(m => m.Player2)
                .WithMany()
                .HasForeignKey(m => m.Player2Id)
                .OnDelete(DeleteBehavior.Restrict);

            // Match → Winner
            modelBuilder.Entity<Match>()
                .HasOne(m => m.Winner)
                .WithMany()
                .HasForeignKey(m => m.WinnerId)
                .OnDelete(DeleteBehavior.Restrict);

            // Match → NextMatch (self-referencing for bracket progression)
            modelBuilder.Entity<Match>()
                .HasOne(m => m.NextMatch)
                .WithMany()
                .HasForeignKey(m => m.NextMatchId)
                .OnDelete(DeleteBehavior.Restrict);

            // ─── Dispute → Match ──────────────────────────────
            modelBuilder.Entity<Dispute>()
                .HasOne(d => d.Match)
                .WithMany(m => m.Disputes)
                .HasForeignKey(d => d.MatchId)
                .OnDelete(DeleteBehavior.Cascade);

            // Dispute → FiledBy User
            modelBuilder.Entity<Dispute>()
                .HasOne(d => d.FiledBy)
                .WithMany()
                .HasForeignKey(d => d.FiledByUserId)
                .OnDelete(DeleteBehavior.Restrict);

            // ─── Decimal precision ────────────────────────────
            modelBuilder.Entity<Tournament>()
                .Property(t => t.PrizePool).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Tournament>()
                .Property(t => t.EntryFee).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Wallet>()
                .Property(w => w.Balance).HasColumnType("decimal(18,2)");
            modelBuilder.Entity<Transaction>()
                .Property(t => t.Amount).HasColumnType("decimal(18,2)");
        }
    }
}