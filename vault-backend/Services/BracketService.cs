using Microsoft.EntityFrameworkCore;
using VaultBackend.Data;
using VaultBackend.Models;

namespace VaultBackend.Services
{
    /// <summary>
    /// Core Service responsible for orchestrating the lifecycle of tournament brackets.
    /// Implements automated seeding, bracket construction, and match propagation logic.
    /// </summary>
    public class BracketService
    {
        private readonly AppDbContext _db;

        public BracketService(AppDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Generates a single-elimination tournament bracket.
        /// Algorithm Overview:
        /// 1. Seed participants by competitive rank (Higher rank = Better seed).
        /// 2. Normalize participant count to the next power of 2 (2, 4, 8, 16, etc.) to handle 'Byes'.
        /// 3. Construct all matches for all rounds from Final down to Opening.
        /// 4. Recursively link matches so winners advance to the correct 'NextMatchId'.
        /// 5. Automatically resolve matches containing 'Byes' by advancing the active player.
        /// </summary>
        /// <param name="tournamentId">The ID of the tournament to generate a bracket for.</param>
        /// <returns>A fully populated Bracket entity with linked matches.</returns>
        public async Task<Bracket> GenerateSingleEliminationBracket(int tournamentId)
        {
            var tournament = await _db.Tournaments
                .FirstOrDefaultAsync(t => t.TournamentId == tournamentId);

            if (tournament == null)
                throw new Exception("Tournament not found");

            if (tournament.Status == TournamentStatus.InProgress)
                throw new Exception("Tournament bracket already generated");

            // Step 1: Fetch and Seed Players
            // Participants are ordered by Rank to ensure top-tier players don't face each other in the first round.
            var registrations = await _db.TournamentRegistrations
                .Include(r => r.User)
                .Where(r => r.TournamentId == tournamentId)
                .OrderByDescending(r => r.User.Rank)
                .ToListAsync();

            if (registrations.Count < 2)
                throw new Exception("Minimum 2 players required for competitive seeding.");

            var players = registrations.Select(r => r.User).ToList();
            int playerCount = players.Count;

            // Step 2: Bracket Normalization
            // Calculate the nearest power of 2. For example, if 6 players register, a bracket of 8 is created.
            int bracketSize = 1;
            while (bracketSize < playerCount) bracketSize *= 2;

            int totalRounds = (int)Math.Log2(bracketSize);

            var bracket = new Bracket
            {
                TournamentId = tournamentId,
                TotalRounds = totalRounds,
            };
            _db.Brackets.Add(bracket);
            await _db.SaveChangesAsync();

            // Step 3: Match Matrix Construction
            // Generate all match slots across all rounds before assigning players.
            var allMatches = new Dictionary<(int round, int matchNum), Match>();

            for (int round = totalRounds; round >= 1; round--)
            {
                int matchesInRound = (int)Math.Pow(2, totalRounds - round);
                for (int m = 1; m <= matchesInRound; m++)
                {
                    var match = new Match
                    {
                        BracketId = bracket.BracketId,
                        Round = round,
                        MatchNumber = m,
                        Status = MatchStatus.Pending,
                    };
                    allMatches[(round, m)] = match;
                    _db.Matches.Add(match);
                }
            }
            await _db.SaveChangesAsync();

            // Step 4: Recursive Match Linking
            // Establish the 'Path to Victory' by linking each match to its parent match in the next round.
            foreach (var kvp in allMatches)
            {
                int round = kvp.Key.round;
                int matchNum = kvp.Key.matchNum;
                var match = kvp.Value;

                if (round < totalRounds)
                {
                    int nextMatchNum = (int)Math.Ceiling(matchNum / 2.0);
                    if (allMatches.ContainsKey((round + 1, nextMatchNum)))
                    {
                        match.NextMatchId = allMatches[(round + 1, nextMatchNum)].MatchId;
                    }
                }
            }
            await _db.SaveChangesAsync();

            // Step 5: Player Seeding & Bye Handling
            // Assign players to the first round. Empty slots become 'Byes' which auto-advance the opponent.
            int matchesInFirstRound = bracketSize / 2;
            var seededPlayers = new int?[bracketSize];
            for (int i = 0; i < playerCount; i++)
            {
                seededPlayers[i] = players[i].UserId;
            }

            for (int m = 1; m <= matchesInFirstRound; m++)
            {
                var match = allMatches[(1, m)];
                int slot1 = (m - 1) * 2;
                int slot2 = (m - 1) * 2 + 1;

                match.Player1Id = slot1 < bracketSize ? seededPlayers[slot1] : null;
                match.Player2Id = slot2 < bracketSize ? seededPlayers[slot2] : null;

                // Automatic Advancement Logic for 'Byes'
                if (match.Player1Id != null && match.Player2Id == null)
                {
                    match.WinnerId = match.Player1Id;
                    match.Status = MatchStatus.Completed;
                    AdvanceWinnerToNextRound(match, allMatches, totalRounds);
                }
                else if (match.Player1Id == null && match.Player2Id != null)
                {
                    match.WinnerId = match.Player2Id;
                    match.Status = MatchStatus.Completed;
                    AdvanceWinnerToNextRound(match, allMatches, totalRounds);
                }
                else if (match.Player1Id != null && match.Player2Id != null)
                {
                    match.Status = MatchStatus.InProgress;
                }
            }

            tournament.Status = TournamentStatus.InProgress;
            await _db.SaveChangesAsync();
            return bracket;
        }

        /// <summary>
        /// Logic to move a winning player to the correct slot in the subsequent round's match.
        /// </summary>
        private void AdvanceWinnerToNextRound(Match match, Dictionary<(int round, int matchNum), Match> allMatches, int totalRounds)
        {
            if (match.Round >= totalRounds || match.WinnerId == null) return;

            int nextMatchNum = (int)Math.Ceiling(match.MatchNumber / 2.0);
            if (!allMatches.ContainsKey((match.Round + 1, nextMatchNum))) return;

            var nextMatch = allMatches[(match.Round + 1, nextMatchNum)];

            // Logic: Odd match numbers become Player1, Even match numbers become Player2.
            if (match.MatchNumber % 2 == 1)
                nextMatch.Player1Id = match.WinnerId;
            else
                nextMatch.Player2Id = match.WinnerId;

            // Activate match if both opponents are ready
            if (nextMatch.Player1Id != null && nextMatch.Player2Id != null)
                nextMatch.Status = MatchStatus.InProgress;
        }
    }
}
