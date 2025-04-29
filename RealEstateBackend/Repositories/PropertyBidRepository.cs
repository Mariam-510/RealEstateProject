using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;
using System.Threading.Tasks;

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
        public async Task<PropertyBid?> GetByIdAsync(int id)
        {
            return await _context.PropertyBids
                .FirstOrDefaultAsync(bid => bid.Id == id && !bid.IsDeleted);
        }
        public async Task<List<PropertyBid>> GetByAuctionIdAsync(int auctionId)
        {
            return await _context.PropertyBids
                .Include(pb => pb.Buyer)
                .ThenInclude(b=>b.Account)
                .Where(pb => pb.AuctionId == auctionId && !pb.IsDeleted)
                .OrderByDescending(pb => pb.Timestamp)
                .ToListAsync();
        }


        public async Task<PropertyBid?> GetLastBidByAuctionIdAsync(int auctionId)
        {
            return await _context.PropertyBids
                .Include(pb => pb.Buyer)
                .ThenInclude(b => b.Account)
                .Where(pb => pb.AuctionId == auctionId && !pb.IsDeleted)
                .OrderByDescending(pb => pb.Timestamp)
                .ThenByDescending(b => b.BidAmount)
                .FirstOrDefaultAsync();
        }
        
    }
}
