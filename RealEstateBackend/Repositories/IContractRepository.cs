using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IContractRepository
    {
        Task<List<Contract>> GetAllAsync();
        Task<Contract?> GetByIdAsync(int id);
        Task<Contract?> GetByPropertyIdAsync(int propertyId);
        Task<Contract> CreateAsync(Contract contract);
        Task<Contract?> UpdateAsync(int id, Contract contract);
        Task<Contract?> DeleteAsync(int id);
    }
}
