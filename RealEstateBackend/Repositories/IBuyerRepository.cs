using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IBuyerRepository
    {
        Task<List<Buyer>> GetAllAsync();
        Task<Buyer?> GetByIdAsync(int id);
        Task<Buyer?> GetByAccountIdAsync(string accountId);
        Task<Buyer> CreateAsync(Buyer buyer);
        Task<Buyer?> UpdateAsync(int id, Buyer buyer);
        Task<Buyer?> DeleteAsync(int id);
    }
}
