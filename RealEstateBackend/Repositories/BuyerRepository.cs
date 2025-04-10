using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class BuyerRepository : IBuyerRepository
    {
        private readonly RealEstateDbContext dbContext;
        public BuyerRepository(RealEstateDbContext dbontext)
        {
            this.dbContext = dbontext;
        }

        public async Task<List<Buyer>> GetAllAsync()
        {
            return await dbContext.Buyers
                .Include(b => b.Account)
                .Where(b => !b.IsDeleted)
                .ToListAsync();
        }

        public async Task<Buyer?> GetByIdAsync(int id)
        {
            return await dbContext.Buyers
                .Include(b => b.Account)
                .Where(b => !b.IsDeleted)
                .FirstOrDefaultAsync(b => b.Id == id);
        }

        public async Task<Buyer?> GetByAccountIdAsync(string accountId)
        {
            return await dbContext.Buyers
                .Include(b => b.Account)
                .Where(b => !b.IsDeleted)
                .FirstOrDefaultAsync(b => b.Account.Id == accountId);
        }

        public async Task<Buyer> CreateAsync(Buyer buyer)
        {
            await dbContext.Buyers.AddAsync(buyer);
            await dbContext.SaveChangesAsync();
            return buyer;
        }

        public async Task<Buyer?> UpdateAsync(int id, Buyer buyer)
        {
            var existingBuyer = await dbContext.Buyers
                .Include(b => b.Account)
                .Where(b => !b.IsDeleted)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (existingBuyer == null)
            {
                return null;
            }
            existingBuyer.FirstName = buyer.FirstName;
            existingBuyer.LastName = buyer.LastName;

            await dbContext.SaveChangesAsync();
            return existingBuyer;
        }

        public async Task<Buyer?> DeleteAsync(int id)
        {
            var existingBuyer = await dbContext.Buyers
                .Include(b => b.Account)
                .Where(b => !b.IsDeleted)
                .FirstOrDefaultAsync(b => b.Id == id);

            if (existingBuyer == null)
            {
                return null;
            }
            existingBuyer.IsDeleted = true;
            //existingBuyer.AccountId = null;

            await dbContext.SaveChangesAsync();
            return existingBuyer;
        }
    }
}
