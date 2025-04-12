using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.SubscriptionDto;

namespace RealEstate.Repositories
{
    public interface ISubscriptionRepository
    {
        Task<Subscription?> GetLastByUserIdAsync(int userId, UserType userType);
        Task<Subscription?> GetByIdAsync(int id);
        //Task<Subscription?> GetCurrentActiveByUserIdAsync(int userId);
        Task<bool> CanAddMorePropertiesAsync(int userId, UserType userType);
        Task<bool> DecreaseAvailablePropertiesByOne(int userId, UserType userType);
        Task AddAsync(Subscription subscription);
        Task UpdateAsync(Subscription subscription);
        Task SaveAsync();
    }
}
