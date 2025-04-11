using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IReviewRepository
    {
        public Task<List<Review>> GetAllAsync();
        public Task<List<Review>> GetAllByProductAsync(int productId);
        public Task<int> GetCountOfProductReviewsAsync(int productId);
        public Task<List<Review>> GetAllByBuyerAsync(int buyerId);
        public Task<Review?> GetByIdAsync(int id);
        public Task<Review?> CreateAsync(Review Review);
        public Task<Review?> UpdateAsync(Review Review);
        public Task<Review?> DeleteAsync(int id);
    }
}
