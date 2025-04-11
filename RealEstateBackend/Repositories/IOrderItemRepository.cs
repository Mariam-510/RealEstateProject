using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IOrderItemRepository
    {
        Task<List<OrderItem>> GetAllAsync();
        Task<List<OrderItem>> GetAllByCartAsync(int cartId);
        Task<List<OrderItem>> GetAllByOrderAsync(int orderId);
        Task<OrderItem?> GetByIdAsync(int id);
        Task<OrderItem> CreateAsync(OrderItem orderItem);
        Task<OrderItem?> UpdateOrderItemQuantityAsync(OrderItem orderItem);
        Task<OrderItem?> UpdateAsync(OrderItem orderItem);
        Task<OrderItem?> DeleteAsync(int id);
        Task<OrderItem?> Exists(int cartId, int productId);
    }
}
