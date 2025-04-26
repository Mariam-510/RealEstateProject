using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IAuctionRepository
    {

        Task<Auction?> CreateAsync(Auction Auction);
        Task<Auction?> UpdateAsync(int id, DateTime StartTime, DateTime EndTime,decimal StartPrice, Status isLive );
        Task<Auction?> DeleteAsync(int id);
        Task<List<Auction?>> GetAllAsync(string? sortByPrice = null, string? sortByTime = null, Status? ISLivestatus = null);
        Task<List<Auction?>> GetByUserID(int? AgentID=null, int? SellerID=null);
        Task<List<Auction>> GetByBuyerID(int BuyerID);
        Task<Auction?> GetByIdAsync(int id);
        Task<Auction?> GetByProprtyIdAsync(int id);

    }
}
