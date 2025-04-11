using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IAdminRepository
    {
        Task<List<Admin>> GetAllAsync();
        Task<Admin?> GetByIdAsync(int id);
        Task<Admin?> GetByAccountIdAsync(string accountId);
        Task<Admin> CreateAsync(Admin admin);
        Task<Admin?> UpdateAsync(int id, Admin admin);
        Task<Admin?> DeleteAsync(int id);
    }
}
