using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class OrderRepository : IOrderRepository
    {
        public RealEstateDbContext _context { get; }

        public OrderRepository(RealEstateDbContext context) 
        {
            _context = context;
        }

        public async Task<List<Order>> GetAllAsync()
        {
            return await _context.Orders
                 .Include(o => o.Buyer)
                 .Include(o => o.OrderItems)
                 .Where(o => !o.IsDeleted)
                 .ToListAsync();
        }

        public async Task<List<Order>> GetAllByBuyerAsync(int buyerId)
        {
            return await _context.Orders
                .Include(o => o.Buyer)
                .Include(o => o.OrderItems)
                .ThenInclude(oi => oi.Product)
                .Include(o => o.Payment)
                .Include(o => o.Address)
                .Where(o => !o.IsDeleted && o.BuyerId == buyerId)
                .OrderByDescending(o => o.OrderDate)
                .ToListAsync();
        }

        public async Task<Order?> GetByIdAsync(int id)
        {
            return await _context.Orders
               .Include(o => o.Buyer)
               .FirstOrDefaultAsync(o => o.Id == id && !o.IsDeleted);
        }

        public async Task<Order> CreateAsync(Order order)
        {
            _context.Orders.Add(order);
            await _context.SaveChangesAsync();
            return order;
        }

        public async Task<Order?> UpdateAsync(Order order)
        {
            var existingOrder = await _context.Orders.FindAsync(order.Id);
            if (existingOrder == null)
                return null;

            existingOrder.Status = order.Status;
            await _context.SaveChangesAsync();
            return existingOrder;
        }

        public async Task DeleteAsync(int id)
        {
            var order = await _context.Orders.FindAsync(id);
            if (order != null)
                order.IsDeleted = true;

            await _context.SaveChangesAsync();
        }
    }
}
