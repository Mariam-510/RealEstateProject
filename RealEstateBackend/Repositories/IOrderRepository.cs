using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IOrderRepository
    {
        Task<List<Order>> GetAllAsync();
        Task<List<Order>> GetAllByBuyerAsync(int buyerId);
        Task<Order?> GetByIdAsync(int id);
        Task<Order> CreateAsync(Order order);
        Task<Order?> UpdateAsync(Order order);
        Task DeleteAsync(int id);
    }
}
