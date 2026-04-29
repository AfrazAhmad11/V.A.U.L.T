namespace VaultBackend.DTOs
{
    public class RegisterDto
    {
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
        public string GameTag { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Rank { get; set; } = "Gold";
        public string? Institution { get; set; }
    }

    public class LoginDto
    {
        public string Email { get; set; } = string.Empty;
        public string Password { get; set; } = string.Empty;
    }

    public class AuthResponseDto
    {
        public string Token { get; set; } = string.Empty;
        public int UserId { get; set; }
        public string Username { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Role { get; set; } = string.Empty;
        public string Rank { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string GameTag { get; set; } = string.Empty;
        public string? Institution { get; set; }
        public bool IsInstitutionVerified { get; set; }
        public int CampusChampionCount { get; set; }
    }

    public class UpdateProfileDto
    {
        public string Username { get; set; } = string.Empty;
        public string GameTag { get; set; } = string.Empty;
        public string City { get; set; } = string.Empty;
        public string Rank { get; set; } = string.Empty;
        public string Bio { get; set; } = string.Empty;
        public string? Institution { get; set; }
    }
}