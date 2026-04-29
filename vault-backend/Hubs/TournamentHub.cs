using Microsoft.AspNetCore.SignalR;

namespace VaultBackend.Hubs
{
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
