using Microsoft.AspNetCore.SignalR;

namespace VaultBackend.Hubs
{
    /// <summary>
    /// SignalR Hub responsible for real-time tournament events.
    /// Manages client group subscriptions (by Tournament ID) and broadcasts 
    /// score updates, winner advancements, and bracket refreshes.
    /// </summary>
    public class TournamentHub : Hub
    {
        public async Task JoinTournamentGroup(string tournamentId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, tournamentId);
        }

        public async Task LeaveTournamentGroup(string tournamentId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, tournamentId);
        }
    }
}
