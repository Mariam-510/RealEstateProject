using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.PropertyDto;

namespace RealEstate.Repositories
{
    public interface IPropertyRepository
    {
        Task<List<Property>> GetFilteredAsync(PropertyCategory? category, PropertyStatus? status, PropertyType? type, string searchByLocation);
        Task<List<Property>> GetAllPropertiesUnfilteredAsync();

        Task<List<Property>> GetAllPending();
        Task<List<Property>> GetAllBySellerIdAsync(int sellerId);
        Task<List<Property>> GetPendingBySellerIdAsync(int sellerId);
        Task<List<Property>> GetApprovedBySellerIdAsync(int sellerId);
        Task<List<Property>> GetRejectedBySellerIdAsync(int sellerId);
        Task<List<Property>> GetAllByAgentIdAsync(int agentId);
        Task<Property?> GetByIdAsync(int id);
        Task AddAsync(Property property);
        Task UpdateAsync(Property property);
        Task DeleteAsync(int id);
        Task <int> GetFilteredBySellerIdAsync(int sellerId, PropertyType? type = null, PropertyStatus? status = null);
        Task <int> GetFilteredByAgentIdAsync(int agentId, PropertyType? type = null, PropertyStatus? status = null);
        Task<decimal> GetTotalSalesBySellerID(int sellerId);
        Task<decimal> GetTotalRentalsBySellerID(int sellerId);
        Task<decimal> GetTotalSalesByAgentID(int agentId);
        Task<decimal> GetTotalRentalsByAgentID(int agentId);
        Task<(Property? Property, int WishlistCount)> GetHighestWishlistedPropertyBySellerIdAsync(int sellerId);
        Task<(Property? Property, int WishlistCount)> GetHighestWishlistedPropertyByAgentIdAsync(int agentId);
        Task<(Property? Property, int CompletedAppointmentCount)> GetMostCompletedAppointmentsBySellerIdAsync(int sellerId);
        Task<(Property? Property, int CompletedAppointmentCount)> GetMostCompletedAppointmentsByAgentIdAsync(int agentId);
        Task<IEnumerable<CategoryRevenueDto>> GetCategoryRevenuesBySellerIdAsync(int sellerId);
        Task<IEnumerable<CategoryRevenueDto>> GetCategoryRevenuesByAgentIdAsync(int agentId);
    }
}
