using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IProductRepository
    {
        Task<Product?> CreateAsync(Product product);
        Task<Product?> UpdateAsync(int id, Product product);
        Task<Product?> DeleteAsync(int id);
        Task<List<Product>> GetAllAsync(string? Name=null, string? SortPrice = null, string? Category=null, string? SortRate = null);
        Task<List<Product>> GetAllProductByCategoryID(int Category);
        Task<Product?> GetByIdAsync(int id);
        Task CalculateAverageRating(int? productId);
    }
}
