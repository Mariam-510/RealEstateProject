
using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.AdminDashboardDto;

namespace RealEstate.Repositories
{
    public class AdminDashboardRepository : IAdminDashboardRepository
    {
        private readonly RealEstateDbContext _context;

        public AdminDashboardRepository(RealEstateDbContext context)
        {
            _context = context;
        }

        public async Task<int> FilterProductsByStatus(bool isUsed)
        {
            int productsTotal= await _context.Products.Where(p=>p.IsUsed==isUsed&&!p.IsDeleted).CountAsync();
            //int productsTotal=products.Count();
            return productsTotal;
        }

        public async Task<UserSummaryDto> GetTotalUsers()
        {
            int buyers = await _context.Buyers.Where(b => !b.IsDeleted).CountAsync();
            int agents = await _context.Agents.Where(a => !a.IsDeleted).CountAsync();
            int sellers = await _context.Sellers.Where(s => !s.IsDeleted).CountAsync();

            int total = buyers + agents + sellers;

            return new UserSummaryDto
            {
                Buyers = buyers,
                Agents = agents,
                Sellers = sellers,
                Total = total
            };
        }

        public async Task<int> GetTotalSoldProducts()
        {
            int soldProductsCount = await _context.Products
                .Where(p => !p.IsDeleted)
                .Where(p => p.ProductStocks.All(s => s.Quantity == 0))
                .CountAsync();

            return soldProductsCount;
        }
        public async Task<decimal> GetHighestSellBidAsync()
        {
            if(_context.PropertyBids.Any())
            {
                return await _context.PropertyBids
                .Where(b => b.Auction != null && b.Auction.Property.Type == PropertyType.Sell && !b.Auction.IsDeleted)
                .MaxAsync(b => b.BidAmount);
            }
            return 0;
            
        }

        public async Task<decimal> GetHighestRentBidAsync()
        {
            if (_context.PropertyBids.Any())
            {
                return await _context.PropertyBids
                .Where(b => b.Auction != null && b.Auction.Property.Type == PropertyType.Rent && !b.Auction.IsDeleted)
                .MaxAsync(b => b.BidAmount);
            }
            return 0;

        }

        public async Task<int> GetUpcomingAuctionsCountAsync()
        {
            var now = DateTime.Now;
            return await _context.Auctions
                .Where(a => a.StartTime > now && !a.IsDeleted)
                .CountAsync();
        }

        public async Task<int> GetEndingAuctionsCountAsync()
        {
            var now = DateTime.Now;
            return await _context.Auctions
                .Where(a =>  a.EndTime <= now && !a.IsDeleted)
                .CountAsync();
        }
        public async Task<double> GetActiveAuctionsPercentageAsync()
        {
            int totalAuctions = await _context.Auctions
                .Where(a => !a.IsDeleted)
                .CountAsync();

            if (totalAuctions == 0)
                return 0;

            int activeAuctions = await _context.Auctions
                .Where(a => !a.IsDeleted && a.Status == Status.Active)
                .CountAsync();

            double percentage = (double)activeAuctions / totalAuctions * 100;
            return Math.Round(percentage, 2); 
        }


        // Implement in ProductRepository
        public async Task<Dictionary<string, double>> GetCategoryPercentagesAsync()
        {
            var products = _context.Products
                .Include(p => p.Category)
                .Where(p => !p.IsDeleted && p.CategoryID != null && !p.Category.IsDeleted);

            var groupedData = await products
                .GroupBy(p => p.Category.Name)
                .Select(g => new { CategoryName = g.Key, Count = g.Count() })
                .ToListAsync();

            int total = groupedData.Sum(g => g.Count);

            if (total == 0)
            {
                return new Dictionary<string, double>();
            }

            var percentages = groupedData.ToDictionary(
                item => item.CategoryName,
                item => Math.Round((item.Count * 100.0) / total, 1)
            );

            return percentages;
        }
        public async Task<Dictionary<string, int>> GetSubscriptionCountsAsync()
        {
            return await _context.Subscriptions
                .Where(s => !s.IsDeleted)
                .Include(s => s.SubscriptionPlan)
                .GroupBy(s => s.SubscriptionPlan.Name)
                .Select(g => new { PlanName = g.Key, Count = g.Count() })
                .ToDictionaryAsync(g => g.PlanName, g => g.Count);
        }
        // In OrderItemRepository.cs
        public async Task<List<object>> GetTopSoldProductsAsync(int count = 5)
        {
            return await _context.OrderItems
                .Where(oi => !oi.IsDeleted)
                .GroupBy(oi => oi.ProductId)
                .Select(g => new
                {
                    ProductName = g.First().Product.Name,
                    TotalSold = g.Sum(oi => oi.Quantity)
                })
                .OrderByDescending(g => g.TotalSold)
                .Take(count)
                .ToListAsync<object>();
        }
    }
}
