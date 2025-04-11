using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class ContractRepository : IContractRepository
    {
        private readonly RealEstateDbContext dbContext;
        public ContractRepository(RealEstateDbContext dbontext)
        {
            this.dbContext = dbontext;
        }

        public async Task<List<Contract>> GetAllAsync()
        {
            return await dbContext.Contracts
                .Include(c => c.Property)
                .Include(c => c.Seller)
                .Where(c => !c.IsDeleted)
                .ToListAsync();
        }

        public async Task<Contract?> GetByIdAsync(int id)
        {
            return await dbContext.Contracts
                .Include(c => c.Property)
                .Include(c => c.Seller)
                .Where(c => !c.IsDeleted)
                .FirstOrDefaultAsync(c => c.Id == id);
        }

        public async Task<Contract?> GetByPropertyIdAsync(int propertyId)
        {
            return await dbContext.Contracts
                .Include(c => c.Property)
                .Include(c => c.Seller)
                .Where(c => !c.IsDeleted)
                .FirstOrDefaultAsync(c => c.PropertyId == propertyId);
        }


        public async Task<Contract> CreateAsync(Contract contract)
        {
            await dbContext.Contracts.AddAsync(contract);
            await dbContext.SaveChangesAsync();
            return contract;
        }

        public async Task<Contract?> UpdateAsync(int id, Contract contract)
        {
            var existingContract = await dbContext.Contracts
                .Include(c => c.Property)
                .Include(c => c.Seller)
                .Where(c => !c.IsDeleted)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (existingContract == null)
            {
                return null;
            }
            existingContract.ImageUrl = contract.ImageUrl;

            await dbContext.SaveChangesAsync();
            return existingContract;
        }

        public async Task<Contract?> DeleteAsync(int id)
        {
            var existingContract = await dbContext.Contracts
                .Include(c => c.Property)
                .Include(c => c.Seller)
                .Where(c => !c.IsDeleted)
                .FirstOrDefaultAsync(c => c.Id == id);

            if (existingContract == null)
            {
                return null;
            }
            existingContract.IsDeleted = true;
            //existingAgent.AccountId = null;

            await dbContext.SaveChangesAsync();

            return existingContract;
        }
    }
}
