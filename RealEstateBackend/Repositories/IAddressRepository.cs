using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IAddressRepository
    {
        public Task<List<Address>> GetAllAsync();
        Task<List<Address>> GetAllByBuyerAsync(int customerId);
        public Task<Address?> GetByIdAsync(int id);
        public Task<Address?> CreateAsync(Address Address);
        public Task<Address?> UpdateAsync(int id, Address Address);
        public Task<Address?> DeleteAsync(int id);
    }
}
