using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IProductStockRepository
    {
        Task<List<ProductStock>> GetAllAsync();
        Task<ProductStock?> GetByIdAsync(int id);
        Task<ProductStock?> GetByColorAsync(int productId, string color);
        Task<List<ProductStock>> GetByProductIdAsync(int productId);
        Task<ProductStock> CreateAsync(ProductStock productStock);
        Task<ProductStock?> UpdateAsync(int id, ProductStock productStock);
        Task<ProductStock?> DeleteAsync(int id);
    }
}
