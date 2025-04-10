using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class AddressRepository : IAddressRepository
    {
        private readonly RealEstateDbContext _context;
        public AddressRepository(RealEstateDbContext context)
        {
            _context = context;
        }
        public Task<List<Address>> GetAllAsync()
        {
            return _context.Addresses
                .Include(a => a.Buyer)
                .Where(a => a.IsDeleted == false)
                .ToListAsync();
        }
        public Task<List<Address>> GetAllByBuyerAsync(int buyerId)
        {
            return _context.Addresses
                .Include(a => a.Buyer)
                .Where(a => a.IsDeleted == false && a.BuyerId == buyerId)
                .OrderByDescending(a => a.Id)
                .ToListAsync();
        }

        public async Task<Address?> GetByIdAsync(int id)
        {
            return await _context.Addresses
                .Include(a => a.Buyer)
                .Where(a => a.IsDeleted == false)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<Address?> CreateAsync(Address Address)
        {
            if (Address != null)
            {
                _context.Addresses.Add(Address);
                await _context.SaveChangesAsync();
                return Address;
            }
            return null;
        }
        public async Task<Address?> UpdateAsync(int id, Address Address)
        {
            var updatedAddress = await GetByIdAsync(id);

            if (updatedAddress != null)
            {
                updatedAddress.City = Address.City;
                updatedAddress.Street = Address.Street;
                updatedAddress.BuildingNum = Address.BuildingNum;
                updatedAddress.Apartment = Address.Apartment;
                updatedAddress.Floor = Address.Floor;
                updatedAddress.PhoneNum = Address.PhoneNum;

                await _context.SaveChangesAsync();
                return updatedAddress;
            }
            else
                return null;
        }

        public async Task<Address?> DeleteAsync(int id)
        {
            var deletedAdd = await GetByIdAsync(id);

            if (deletedAdd != null)
            {
                deletedAdd.IsDeleted = true;
                await _context.SaveChangesAsync();
                return deletedAdd;
            }
            return null;
        }


    }
}
