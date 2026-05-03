namespace VaultBackend.DTOs
{
    public class CreateTournamentDto
    {
        public string Title { get; set; } = string.Empty;
        public string GameTitle { get; set; } = string.Empty;
        public string GameTag { get; set; } = string.Empty;
        public decimal PrizePool { get; set; }
        public decimal EntryFee { get; set; }
        public int MaxSlots { get; set; }
        public string City { get; set; } = string.Empty;
        public string Rules { get; set; } = string.Empty;
        public string AccentColor { get; set; } = "#6C63FF";
        public bool IsVerifiedCafe { get; set; }
        public string? TargetInstitution { get; set; }
        public DateTime StartsAt { get; set; }
    }

    public class TournamentResponseDto
    {
        public int TournamentId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string GameTitle { get; set; } = string.Empty;
        public string GameTag { get; set; } = string.Empty;
        public decimal PrizePool { get; set; }
        public decimal EntryFee { get; set; }
        public int MaxSlots { get; set; }
        public int FilledSlots { get; set; }
        public string City { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public string Rules { get; set; } = string.Empty;
        public string AccentColor { get; set; } = string.Empty;
        public string OrganizerName { get; set; } = string.Empty;
        public int OrganizerId { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsVerifiedCafe { get; set; }
        public string? TargetInstitution { get; set; }
        public DateTime StartsAt { get; set; }
    }
}