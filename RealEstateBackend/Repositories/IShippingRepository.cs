using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IShippingRepository
    {
        Task<List<Shipping>> GetAllAsync();
        Task<Shipping?> GetByIdAsync(int id);
        Task<Shipping?> GetByCityAsync(string city);
        Task<Shipping> CreateAsync(Shipping shipping);
        Task<Shipping?> UpdateAsync(int id, Shipping shipping);
        Task<Shipping?> DeleteAsync(int id);
    }
}
