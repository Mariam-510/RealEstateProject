using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class AdminRepository : IAdminRepository
    {
        private readonly RealEstateDbContext dbContext;
        public AdminRepository(RealEstateDbContext dbontext)
        {
            this.dbContext = dbontext;
        }

        public async Task<List<Admin>> GetAllAsync()
        {
            return await dbContext.Admins
                .Include(a => a.Account)
                .Where(a => !a.IsDeleted)
                .ToListAsync();
        }

        public async Task<Admin?> GetByIdAsync(int id)
        {
            return await dbContext.Admins
                .Include(a => a.Account)
                .Where(a => !a.IsDeleted)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<Admin?> GetByAccountIdAsync(string accountId)
        {
            return await dbContext.Admins
                .Include(a => a.Account)
                .Where(a => !a.IsDeleted)
                .FirstOrDefaultAsync(a => a.Account.Id == accountId);
        }


        public async Task<Admin> CreateAsync(Admin admin)
        {
            await dbContext.Admins.AddAsync(admin);
            await dbContext.SaveChangesAsync();
            return admin;
        }

        public async Task<Admin?> UpdateAsync(int id, Admin admin)
        {
            var existingAdmin = await dbContext.Admins
                .Include(a => a.Account)
                .Where(a => !a.IsDeleted)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (existingAdmin == null)
            {
                return null;
            }
            existingAdmin.Name = admin.Name;

            await dbContext.SaveChangesAsync();
            return existingAdmin;
        }

        public async Task<Admin?> DeleteAsync(int id)
        {
            var existingAdmin = await dbContext.Admins
                .Include(a => a.Account)
                .Where(a => !a.IsDeleted)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (existingAdmin == null)
            {
                return null;
            }
            existingAdmin.IsDeleted = true;
            //existingAgent.AccountId = null;

            await dbContext.SaveChangesAsync();
            return existingAdmin;
        }
    }
}
