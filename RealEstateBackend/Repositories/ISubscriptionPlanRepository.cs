using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface ISubscriptionPlanRepository
    {
        Task<IEnumerable<SubscriptionPlan>> GetAllAsync();
        Task<SubscriptionPlan?> GetByIdAsync(int id);
        Task<SubscriptionPlan?> GetByNameAsync(string name);
        Task AddAsync(SubscriptionPlan plan);
        Task UpdateAsync(SubscriptionPlan plan);
        Task<bool> ExistsAsync(int id);
        Task SaveAsync();
    }
}
