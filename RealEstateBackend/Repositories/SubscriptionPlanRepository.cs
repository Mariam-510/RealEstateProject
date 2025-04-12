using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class SubscriptionPlanRepository : ISubscriptionPlanRepository
    {
        private readonly RealEstateDbContext _context;
        public SubscriptionPlanRepository(RealEstateDbContext context) => _context = context;

        public async Task<IEnumerable<SubscriptionPlan>> GetAllAsync() =>
            await _context.SubscriptionPlans.Where(p => !p.IsDeleted).ToListAsync();

        public async Task<SubscriptionPlan?> GetByIdAsync(int id) =>
            await _context.SubscriptionPlans.FirstOrDefaultAsync(p => p.Id == id && !p.IsDeleted);

        public async Task<SubscriptionPlan?> GetByNameAsync(string name) =>
            await _context.SubscriptionPlans
                .FirstOrDefaultAsync(p => p.Name.ToLower().Contains(name.ToLower()) && !p.IsDeleted);

        public async Task AddAsync(SubscriptionPlan plan)
        {
            await _context.SubscriptionPlans.AddAsync(plan);
            await SaveAsync();
        }

        public async Task UpdateAsync(SubscriptionPlan plan)
        {
            _context.SubscriptionPlans.Update(plan);
            await SaveAsync();

        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await _context.SubscriptionPlans.AnyAsync(p => p.Id == id && !p.IsDeleted);
        }


        public async Task SaveAsync() => await _context.SaveChangesAsync();
    }

}
