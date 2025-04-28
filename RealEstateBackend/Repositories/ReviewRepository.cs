using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class ReviewRepository : IReviewRepository
    {
        public RealEstateDbContext _context { get; }
        public IProductRepository _productRepository { get; }

        public ReviewRepository(RealEstateDbContext context, IProductRepository productRepository)
        {
            _context = context;
            _productRepository = productRepository;
        }

        public Task<List<Review>> GetAllAsync()
        {
            return _context.Reviews
                .Include(r => r.Buyer)
                .ThenInclude(b => b.Account)
                .Include(r => r.Product)
                .ThenInclude(p=>p.Category)
                .Where(r => r.IsDeleted == false)
                .ToListAsync();
        }

        public Task<List<Review>> GetAllByProductAsync(int productId)
        {
            return _context.Reviews
                .Include(r => r.Buyer)
                .ThenInclude(b => b.Account)
                .Include(r => r.Product)
                .ThenInclude(p => p.Category)
                .Where(r => r.IsDeleted == false && r.ProductId == productId)
                .OrderByDescending(r => r.Date)
                .ToListAsync();
        }

        public Task<int> GetCountOfProductReviewsAsync(int productId)
        {
            return _context.Reviews
                .Where(r => r.IsDeleted == false && r.ProductId == productId)
                .CountAsync();
        }

        public Task<List<Review>> GetAllByBuyerAsync(int buyerId)
        {
            return _context.Reviews
                .Include(r => r.Buyer)
                .ThenInclude(b=>b.Account)
                .Include(r => r.Product)
                .ThenInclude(p => p.Category)
                .Where(r => r.IsDeleted == false && r.BuyerId == buyerId)
                .OrderByDescending(r => r.Date)
                .ToListAsync();
        }

        public async Task<Review?> GetByIdAsync(int id)
        {
            return await _context.Reviews
                .Include(r => r.Buyer)
                .ThenInclude(b => b.Account)
                .Include(r => r.Product)
                .ThenInclude(p => p.Category)
                .Where(r => r.IsDeleted == false)
                .FirstOrDefaultAsync(r => r.Id == id);
        }

        public async Task<Review?> CreateAsync(Review Review)
        {
            if (Review != null)
            {
                _context.Reviews.Add(Review);
                await _context.SaveChangesAsync();
                await _productRepository.CalculateAverageRating(Review.ProductId);
                return Review;
            }
            return null;
        }

        public async Task<Review?> UpdateAsync(Review review)
        {
            var updatedReview = await GetByIdAsync(review.Id);

            if (updatedReview != null)
            {
                updatedReview.Rating = review.Rating;
                updatedReview.Comment = review.Comment;
                updatedReview.Date = review.Date;

                await _context.SaveChangesAsync();

                await _productRepository.CalculateAverageRating(review.ProductId);
                return updatedReview;
            }
            else
                return null;
        }

        public async Task<Review?> DeleteAsync(int id)
        {
            var deletedRev = await GetByIdAsync(id);

            if (deletedRev != null)
            {
                deletedRev.IsDeleted = true;
                await _context.SaveChangesAsync();

                await _productRepository.CalculateAverageRating(deletedRev.ProductId);
                return deletedRev;
            }
            return null;
        }
    }
}
