using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class ShippingRepository : IShippingRepository
    {
        
        private readonly RealEstateDbContext dbContext;
        public ShippingRepository(RealEstateDbContext dbontext)
        {
            this.dbContext = dbontext;
        }

        public async Task<List<Shipping>> GetAllAsync()
        {
            return await dbContext.Shippings
                .Where(s => !s.IsDeleted)
                .ToListAsync();
        }

        public async Task<Shipping?> GetByIdAsync(int id)
        {
            return await dbContext.Shippings
                .Where(s => !s.IsDeleted)
                .FirstOrDefaultAsync(s => s.Id == id);
        }

        public async Task<Shipping?> GetByCityAsync(string city)
        {
            return await dbContext.Shippings
                .Where(s => !s.IsDeleted && s.City.ToLower().Contains(city.ToLower()))
                .FirstOrDefaultAsync();
        }

        public async Task<decimal> GetAvgDeliveryFeesAsync()
        {
            return await dbContext.Shippings
                .Where(s => !s.IsDeleted)
                .AverageAsync(s => s.DeliveryFees);
        }

        public async Task<bool> IsCityExistAsync(string city)
        {
            return await dbContext.Shippings
                .AnyAsync(s => !s.IsDeleted && s.City.ToLower() == city.ToLower());
        }

        public async Task<Shipping> CreateAsync(Shipping shipping)
        {
            await dbContext.Shippings.AddAsync(shipping);
            await dbContext.SaveChangesAsync();
            return shipping;
        }

        public async Task<Shipping?> UpdateAsync(int id, Shipping shipping)
        {
            var existingShipping = await dbContext.Shippings
                .Where(s => !s.IsDeleted)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (existingShipping == null)
            {
                return null;
            }
            existingShipping.City = shipping.City;
            existingShipping.DeliveryFees = shipping.DeliveryFees;

            await dbContext.SaveChangesAsync();
            return existingShipping;
        }

        public async Task<Shipping?> DeleteAsync(int id)
        {
            var existingShipping = await dbContext.Shippings
                .Where(s => !s.IsDeleted)
                .FirstOrDefaultAsync(s => s.Id == id);

            if (existingShipping == null)
            {
                return null;
            }
            existingShipping.IsDeleted = true;

            await dbContext.SaveChangesAsync();

            return existingShipping;
        }
    }
}
