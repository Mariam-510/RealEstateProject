using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IAuctionBuyerRepository
    {
        Task<List<AuctionBuyer>> GetAllAsync();
        Task<AuctionBuyer?> GetByIdAsync(int id);
        Task<AuctionBuyer?> GetByAuctionAndBuyerIdAsync(int buyerId, int auctionId);
        Task<List<Buyer?>?> GetAllBuyersByAuctionAsync(int auctionId);
        Task<List<Auction?>?> GetAllAuctionsByBuyerAsync(int buyerId);
        Task<AuctionBuyer> CreateAsync(AuctionBuyer auctionBuyer);
        Task<AuctionBuyer?> DeleteAsync(int id);
    }
}
