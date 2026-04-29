using Microsoft.EntityFrameworkCore;
using VaultBackend.Data;
using VaultBackend.Models;

namespace VaultBackend.Services
{
    public class BracketService
    {
        private readonly AppDbContext _db;

        public BracketService(AppDbContext db)
        {
            _db = db;
        }

        /// <summary>
        /// Generates a single elimination bracket for a tournament.
        /// Handles byes when player count is not a power of 2.
        /// Seeds players by rank (higher rank = higher seed).
        /// </summary>
        public async Task<Bracket> GenerateSingleEliminationBracket(int tournamentId)
        {
            var tournament = await _db.Tournaments
                .FirstOrDefaultAsync(t => t.TournamentId == tournamentId);

            if (tournament == null)
                throw new Exception("Tournament not found");

            if (tournament.Status == TournamentStatus.InProgress)
                throw new Exception("Tournament bracket already generated");

            // Get registered players, ordered by rank (best first for seeding)
            var registrations = await _db.TournamentRegistrations
                .Include(r => r.User)
                .Where(r => r.TournamentId == tournamentId)
                .OrderByDescending(r => r.User.Rank) // Higher rank = better seed
                .ToListAsync();

            if (registrations.Count < 2)
                throw new Exception("Need at least 2 players to generate bracket");

            var players = registrations.Select(r => r.User).ToList();
            int playerCount = players.Count;

            // Calculate bracket size (next power of 2)
            int bracketSize = 1;
            while (bracketSize < playerCount) bracketSize *= 2;

            int totalRounds = (int)Math.Log2(bracketSize);

            // Create bracket
            var bracket = new Bracket
            {
                TournamentId = tournamentId,
                TotalRounds = totalRounds,
            };
            _db.Brackets.Add(bracket);
            await _db.SaveChangesAsync();

            // Create all matches for every round
            var allMatches = new Dictionary<(int round, int matchNum), Match>();

            // Create matches from final round down to first
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

            // Link matches: winner of round R match M goes to round R+1 match ceil(M/2)
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

            // Seed players into round 1 matches
            int matchesInFirstRound = bracketSize / 2;
            int byeCount = bracketSize - playerCount;

            // Standard seeding: 1 vs bracketSize, 2 vs bracketSize-1, etc.
            var seededPlayers = new int?[bracketSize];
            for (int i = 0; i < playerCount; i++)
            {
                seededPlayers[i] = players[i].UserId;
            }
            // Remaining slots are null (byes)

            // Assign players to round 1 matches
            for (int m = 1; m <= matchesInFirstRound; m++)
            {
                var match = allMatches[(1, m)];
                int slot1 = (m - 1) * 2;
                int slot2 = (m - 1) * 2 + 1;

                match.Player1Id = slot1 < bracketSize ? seededPlayers[slot1] : null;
                match.Player2Id = slot2 < bracketSize ? seededPlayers[slot2] : null;

                // If one player has a bye, auto-advance them
                if (match.Player1Id != null && match.Player2Id == null)
                {
                    match.WinnerId = match.Player1Id;
                    match.Status = MatchStatus.Completed;
                    AdvanceWinner(match, allMatches, totalRounds);
                }
                else if (match.Player1Id == null && match.Player2Id != null)
                {
                    match.WinnerId = match.Player2Id;
                    match.Status = MatchStatus.Completed;
                    AdvanceWinner(match, allMatches, totalRounds);
                }
                else if (match.Player1Id != null && match.Player2Id != null)
                {
                    match.Status = MatchStatus.InProgress;
                }
            }

            // Update tournament status
            tournament.Status = TournamentStatus.InProgress;

            await _db.SaveChangesAsync();
            return bracket;
        }

        /// <summary>
        /// Places the winner into the correct slot of the next match.
        /// </summary>
        private void AdvanceWinner(Match match, Dictionary<(int round, int matchNum), Match> allMatches, int totalRounds)
        {
            if (match.Round >= totalRounds || match.WinnerId == null) return;

            int nextMatchNum = (int)Math.Ceiling(match.MatchNumber / 2.0);
            if (!allMatches.ContainsKey((match.Round + 1, nextMatchNum))) return;

            var nextMatch = allMatches[(match.Round + 1, nextMatchNum)];

            // Odd match number → Player1 slot, Even → Player2 slot
            if (match.MatchNumber % 2 == 1)
                nextMatch.Player1Id = match.WinnerId;
            else
                nextMatch.Player2Id = match.WinnerId;

            // If both players are now assigned, set to InProgress
            if (nextMatch.Player1Id != null && nextMatch.Player2Id != null)
                nextMatch.Status = MatchStatus.InProgress;
        }
    }
}
