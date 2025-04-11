using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface ISubscriptionRepository
    {
        Task<Subscription> GetLastByUserIdAsync(int userId);
        Task<Subscription?> GetByIdAsync(int id);
        Task AddAsync(Subscription subscription);
        Task<Subscription?> GetCurrentActiveByUserIdAsync(int userId);
        Task UpdateAsync(Subscription subscription);
        Task SaveAsync();
    }
}
