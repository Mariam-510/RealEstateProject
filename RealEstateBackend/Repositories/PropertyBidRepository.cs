using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class PropertyBidRepository: IPropertyBidRepository
    {
        private readonly RealEstateDbContext _context;

        public PropertyBidRepository(RealEstateDbContext context)
        {
            _context = context;
        }
        public async Task<PropertyBid> AddAsync(PropertyBid propertyBid)
        {
            await _context.PropertyBids.AddAsync(propertyBid);
            await _context.SaveChangesAsync();
            return propertyBid;
        }
        public async Task<PropertyBid> GetByIdAsync(int id)
        {
            return await _context.PropertyBids
                .FirstOrDefaultAsync(bid => bid.Id == id && !bid.IsDeleted);
        }
        public async Task<List<PropertyBid>> GetByAuctionIdAsync(int auctionId)
        {
            return await _context.PropertyBids
                .Include(pb => pb.Buyer)
                .Where(pb => pb.AuctionId == auctionId && !pb.IsDeleted)
                .ToListAsync();
        }


    }
}
