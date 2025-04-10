using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IPropertyRepository
    {
        Task<List<Property>> GetAllAsync();
        Task<Property> GetByIdAsync(int id);
        Task<List<Property>> GetAllBySellerIdAsync(int sellerId);
        Task<List<Property>> GetAllByAgentIdAsync(int agentId);
        
        Task AddAsync(Property property);
        Task UpdateAsync(Property property);
        Task DeleteAsync(int id);
        Task<List<Property>> GetFilteredAsync(PropertyCategory? category, PropertyStatus? status, PropertyType? type, string searchByLocation);
        }
}
