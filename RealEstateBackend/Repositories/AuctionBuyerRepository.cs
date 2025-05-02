using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class AuctionBuyerRepository : IAuctionBuyerRepository
    {
        private readonly RealEstateDbContext dbContext;
        public AuctionBuyerRepository(RealEstateDbContext dbontext)
        {
            this.dbContext = dbontext;
        }

        public async Task<List<AuctionBuyer>> GetAllAsync()
        {
            return await dbContext.AuctionBuyers
                .Include(ab => ab.Auction)
                .Include(ab => ab.Buyer)
                .Include(ab => ab.Payment)
                .Where(ab => !ab.IsDeleted)
                .ToListAsync();
        }

        public async Task<AuctionBuyer?> GetByIdAsync(int id)
        {
            return await dbContext.AuctionBuyers
                .Include(ab => ab.Auction)
                .Include(ab => ab.Buyer)
                .Include(ab => ab.Payment)
                .Where(ab => !ab.IsDeleted)
                .FirstOrDefaultAsync(ab => ab.Id == id);
        }
        
        public async Task<AuctionBuyer?> GetByAuctionAndBuyerIdAsync(int buyerId, int auctionId)
        {
            return await dbContext.AuctionBuyers
                .Include(ab => ab.Auction)
                .Include(ab => ab.Buyer)
                .Include(ab => ab.Payment)
                .Where(ab => !ab.IsDeleted && ab.BuyerId == buyerId && ab.AuctionId == auctionId)
                .FirstOrDefaultAsync();
        }

        public async Task<List<Buyer?>?> GetAllBuyersByAuctionAsync(int auctionId)
        {
            if (!await dbContext.Auctions.AnyAsync(a => a.Id == auctionId))
                return null;

            return await dbContext.AuctionBuyers
                .Include(ab => ab.Buyer)
                .ThenInclude(b => b.Account)
                .Where(ab => !ab.IsDeleted && ab.AuctionId == auctionId)
                .Select(ab => ab.Buyer)
                .ToListAsync();
        }

        public async Task<List<Auction?>?> GetAllAuctionsByBuyerAsync(int buyerId)
        {
            if (!await dbContext.Buyers.AnyAsync(b => b.Id == buyerId))
                return null;

            return await dbContext.AuctionBuyers
                .Include(ab => ab.Auction)
                .Where(ab => !ab.IsDeleted && ab.BuyerId == buyerId)
                .Select(ab => ab.Auction)
                .ToListAsync();
        }

        public async Task<AuctionBuyer> CreateAsync(AuctionBuyer contract)
        {
            await dbContext.AuctionBuyers.AddAsync(contract);
            await dbContext.SaveChangesAsync();
            return contract;
        }

        public async Task<AuctionBuyer?> DeleteAsync(int id)
        {
            var existingAuctionBuyer = await dbContext.AuctionBuyers
                .Include(ab => ab.Auction)
                .Include(ab => ab.Buyer)
                .Include(ab => ab.Payment)
                .Where(ab => !ab.IsDeleted)
                .FirstOrDefaultAsync(ab => ab.Id == id);

            if (existingAuctionBuyer == null)
            {
                return null;
            }
            existingAuctionBuyer.IsDeleted = true;

            await dbContext.SaveChangesAsync();

            return existingAuctionBuyer;
        }
    }
}
