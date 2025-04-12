using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.SubscriptionDto;

namespace RealEstate.Repositories
{
    public class SubscriptionRepository : ISubscriptionRepository
    {
        private readonly RealEstateDbContext _context;
        public SubscriptionRepository(RealEstateDbContext context) => _context = context;

        //public async Task<Subscription?> GetLastByUserIdAsync(int userId)
        //{
        //    return await _context.Subscriptions
        //        .Where(s => (s.SellerId == userId || s.AgentId == userId) && !s.IsDeleted)
        //        .Include(s => s.SubscriptionPlan)
        //        .OrderByDescending(s => s.Id) 
        //        .FirstOrDefaultAsync();
        //}

        //public async Task<Subscription?> GetCurrentActiveByUserIdAsync(int userId)
        //{
        //    return await _context.Subscriptions
        //        .Where(s => (s.SellerId == userId || s.AgentId == userId) && !s.IsDeleted)
        //        .FirstOrDefaultAsync();
        //}


        public async Task<Subscription?> GetLastByUserIdAsync(int userId, UserType userType)
        {
            var query = _context.Subscriptions
                .Where(s => !s.IsDeleted)
                .Include(s => s.SubscriptionPlan)
                .OrderByDescending(s => s.Id)
                .AsQueryable();

            switch (userType)
            {
                case UserType.Seller:
                    query = query.Where(s => s.SellerId == userId);
                    break;
                case UserType.Agent:
                    query = query.Where(s => s.AgentId == userId);
                    break;
                default:
                    return null;
            }

            return await query.FirstOrDefaultAsync();
        }

        public async Task<Subscription?> GetByIdAsync(int id) =>
            await _context.Subscriptions.Include(s => s.SubscriptionPlan).FirstOrDefaultAsync(s => s.Id == id);

        public async Task AddAsync(Subscription subscription)
        {
            _context.Subscriptions.Add(subscription);
            await SaveAsync();
        }

        public async Task UpdateAsync(Subscription subscription)
        {
            _context.Subscriptions.Update(subscription);
            await SaveAsync();

        }

        public async Task<bool> CanAddMorePropertiesAsync(int userId, UserType userType)
        {
            var subscription = await GetLastByUserIdAsync(userId, userType);

            if (subscription == null)
                return false;

            return subscription.AvailableProperties > 0;
        }

        public async Task<bool> DecreaseAvailablePropertiesByOne(int userId, UserType userType)
        {
            var subscription = await GetLastByUserIdAsync(userId, userType);

            if (subscription == null)
                return false;

            if (subscription.AvailableProperties > 0)
            {
                subscription.AvailableProperties--;

                _context.Subscriptions.Update(subscription);
            }
            return true;
        }

        public async Task SaveAsync() => await _context.SaveChangesAsync();
    }
}
