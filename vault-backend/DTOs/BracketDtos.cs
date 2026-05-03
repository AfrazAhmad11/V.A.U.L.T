namespace VaultBackend.DTOs
{
    // ─── Bracket DTOs ─────────────────────────────────
    public class BracketResponseDto
    {
        public int BracketId { get; set; }
        public int TournamentId { get; set; }
        public string TournamentTitle { get; set; } = string.Empty;
        public int TotalRounds { get; set; }
        public DateTime CreatedAt { get; set; }
        public List<MatchResponseDto> Matches { get; set; } = new();
        public List<TournamentPlayerDto> Players { get; set; } = new();
    }

    public class TournamentPlayerDto
    {
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string GameTag { get; set; } = string.Empty;
        public string Rank { get; set; } = string.Empty;
        public string? Institution { get; set; }
        public string City { get; set; } = string.Empty;
    }

    // ─── Match DTOs ───────────────────────────────────
    public class MatchResponseDto
    {
        public int MatchId { get; set; }
        public int Round { get; set; }
        public int MatchNumber { get; set; }
        public int? Player1Id { get; set; }
        public string? Player1Name { get; set; }
        public int? Player2Id { get; set; }
        public string? Player2Name { get; set; }
        public int? WinnerId { get; set; }
        public string? WinnerName { get; set; }
        public int? Player1Score { get; set; }
        public int? Player2Score { get; set; }
        public string Status { get; set; } = string.Empty;
        public int? NextMatchId { get; set; }
    }

    public class ReportMatchDto
    {
        public int Player1Score { get; set; }
        public int Player2Score { get; set; }
    }

    // ─── Dispute DTOs ─────────────────────────────────
    public class CreateDisputeDto
    {
        public int MatchId { get; set; }
        public string Reason { get; set; } = string.Empty;
        public string? EvidenceUrl { get; set; }
    }

    public class DisputeResponseDto
    {
        public int DisputeId { get; set; }
        public int MatchId { get; set; }
        public int FiledByUserId { get; set; }
        public string FiledByUsername { get; set; } = string.Empty;
        public string Reason { get; set; } = string.Empty;
        public string? EvidenceUrl { get; set; }
        public string Status { get; set; } = string.Empty;
        public string? Resolution { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? ResolvedAt { get; set; }
    }

    public class ResolveDisputeDto
    {
        public string Resolution { get; set; } = string.Empty;
        public string Status { get; set; } = "Resolved"; // Resolved or Dismissed
        public int? WinnerId { get; set; }
    }
}
