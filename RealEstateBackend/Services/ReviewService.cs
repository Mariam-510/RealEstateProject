using Google;
using RealEstate.Data;
using RealEstate.Models.Domains;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace RealEstate.Services
{
    public class ReviewService
    {
        private readonly RealEstateDbContext _context;

        public ReviewService(RealEstateDbContext context)
        {
            _context = context;
        }

  
        public double CalculateAverageRating(int productId)
        {
            var reviews = _context.Reviews
                .Where(r => r.ProductId == productId && !r.IsDeleted)
                .ToList();

            if (!reviews.Any())
                return 0;

            return reviews.Average(r => r.Rating);
        }

     
        public List<Review> GetProductReviews(int productId)
        {
            return _context.Reviews
                .Where(r => r.ProductId == productId && !r.IsDeleted)
                .OrderByDescending(r => r.Date)
                .ToList();
        }


        public Dictionary<double, int> GetRatingDistribution(int productId)
        {
            return _context.Reviews
                .Where(r => r.ProductId == productId && !r.IsDeleted)
                .GroupBy(r => r.Rating)
                .OrderBy(g => g.Key)
                .ToDictionary(g => g.Key, g => g.Count());
        }

      
        public int GetReviewCount(int productId)
        {
            return _context.Reviews
                .Count(r => r.ProductId == productId && !r.IsDeleted);
        }
    }
}