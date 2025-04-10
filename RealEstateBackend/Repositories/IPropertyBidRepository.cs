using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IPropertyBidRepository
    {
        Task<PropertyBid> AddAsync(PropertyBid propertyBid);
        Task<PropertyBid> GetByIdAsync(int id);
        Task<List<PropertyBid>> GetByAuctionIdAsync(int auctionId);


    }
}
