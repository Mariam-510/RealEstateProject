using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface ICartRepository
    {
        Task<List<Cart>> GetAllAsync();
        Task<Cart?> GetByIdAsync(int id);
        Task<Cart?> GetByBuyerIdAsync(int buyerId);
        Task<Cart> CreateAsync(Cart cart);
        Task<Cart?> UpdateAsync(Cart cart);
        Task<Cart?> DeleteAsync(int id);

    }
}
