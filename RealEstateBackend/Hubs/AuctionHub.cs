using Microsoft.AspNetCore.SignalR;

namespace RealEstate.Hubs
{
    public class AuctionHub : Hub
    {
        public async Task JoinAuctionGroup(int auctionId)
        {
            await Groups.AddToGroupAsync(Context.ConnectionId, $"Auction-{auctionId}");
        }

        public async Task LeaveAuctionGroup(int auctionId)
        {
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"Auction-{auctionId}");
        }
    }
}
