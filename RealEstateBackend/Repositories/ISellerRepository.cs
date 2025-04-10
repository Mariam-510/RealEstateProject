using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface ISellerRepository
    {
        Task<List<Seller>> GetAllAsync();
        Task<Seller?> GetByIdAsync(int id);
        Task<Seller?> GetByAccountIdAsync(string accountId);
        Task<Seller> CreateAsync(Seller seller);
        Task<Seller?> UpdateAsync(int id, Seller seller);
        Task<Seller?> DeleteAsync(int id);
    }
}
