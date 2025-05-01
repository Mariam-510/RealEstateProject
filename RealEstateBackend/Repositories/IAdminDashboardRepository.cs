using RealEstate.Models.DTOs.AdminDashboardDto;

namespace RealEstate.Repositories
{
    public interface IAdminDashboardRepository
    {
        Task<UserSummaryDto> GetTotalUsers();
        Task<int> FilterProductsByStatus(bool isUsed);
        Task<int> GetTotalSoldProducts();
        Task<decimal> GetHighestSellBidAsync();
        Task<decimal> GetHighestRentBidAsync();
        Task<int> GetUpcomingAuctionsCountAsync();
        Task<int> GetEndingAuctionsCountAsync();
        Task<double> GetActiveAuctionsPercentageAsync();
        Task<Dictionary<string, double>> GetCategoryPercentagesAsync();
        Task<Dictionary<string, int>> GetSubscriptionCountsAsync();
        Task<List<object>> GetTopSoldProductsAsync(int count = 5);
    }
}
