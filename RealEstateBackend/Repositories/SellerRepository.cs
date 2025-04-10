using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class SellerRepository: ISellerRepository
    {
        private readonly RealEstateDbContext dbContext;
        public SellerRepository(RealEstateDbContext dbontext)
        {
            this.dbContext = dbontext;
        }

        public async Task<List<Seller>> GetAllAsync()
        {
            return await dbContext.Sellers
                .Include(s => s.Account)
                .Where(s => !s.IsDeleted)
                .ToListAsync();
        }

        public async Task<Seller?> GetByIdAsync(int id)
        {
            return await dbContext.Sellers
                .Include(s => s.Account)
                .Where(s => !s.IsDeleted)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<Seller?> GetByAccountIdAsync(string accountId)
        {
            return await dbContext.Sellers
                .Include(s => s.Account)
                .Where(s => !s.IsDeleted)
                .FirstOrDefaultAsync(s => s.Account.Id == accountId);
        }

        public async Task<Seller> CreateAsync(Seller seller)
        {
            await dbContext.Sellers.AddAsync(seller);
            await dbContext.SaveChangesAsync();
            return seller;
        }

        public async Task<Seller?> UpdateAsync(int id, Seller seller)
        {
            var existingSeller = await dbContext.Sellers
                .Include(s => s.Account)
                .Where(s => !s.IsDeleted)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (existingSeller == null)
            {
                return null;
            }
            existingSeller.FirstName = seller.FirstName;
            existingSeller.LastName = seller.LastName;

            await dbContext.SaveChangesAsync();
            return existingSeller;
        }

        public async Task<Seller?> DeleteAsync(int id)
        {
            var existingSeller = await dbContext.Sellers
                .Include(s => s.Account)
                .Where(s => !s.IsDeleted)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (existingSeller == null)
            {
                return null;
            }
            existingSeller.IsDeleted = true;
            //existingSeller.AccountId = null;

            await dbContext.SaveChangesAsync();
            return existingSeller;
        }

    }
}
