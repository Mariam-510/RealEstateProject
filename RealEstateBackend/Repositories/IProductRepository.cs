using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IProductRepository
    {
        Task<Product?> CreateAsync(Product product);
        Task<Product?> UpdateAsync(int id, Product product);
        Task<bool> DeleteAsync(int id);
        Task<List<Product>> GetAllAsync(string? Name, bool ascending = true);
        Task<Product?> GetByIdAsync(int id);
      



    }
}
