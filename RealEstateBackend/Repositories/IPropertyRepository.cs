using RealEstate.Models.Domains;

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
        }
}
