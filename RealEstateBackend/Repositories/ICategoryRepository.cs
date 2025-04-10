using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface ICategoryRepository
    {
        Task<CategoryResultMsg> CreateAsync(Category category);
        Task<CategoryResultMsg> UpdateAsync(int id,Category category);
        Task<Category?> DeleteAsync(int id);
        Task<Category?> GetCategoryByIdAsync(int id);
        Task<List<Category?>> GetAllAsync();

    }
}
