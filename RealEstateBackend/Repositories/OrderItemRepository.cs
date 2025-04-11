using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class OrderItemRepository : IOrderItemRepository
    {
        private readonly RealEstateDbContext dbContext;
        public OrderItemRepository(RealEstateDbContext dbontext)
        {
            dbContext = dbontext;
        }

        public async Task<List<OrderItem>> GetAllAsync()
        {
            var orderItems = await dbContext.OrderItems
                .Where(o => !o.IsDeleted)
                .Include(o => o.Product).ToListAsync();

            await dbContext.SaveChangesAsync();
            return orderItems;

        }

        public async Task<List<OrderItem>> GetAllByCartAsync(int cartId)
        {
            var orderItems = await dbContext.OrderItems
                .Where(o => !o.IsDeleted && o.CartId == cartId)
                .Include(o => o.Product).ToListAsync();

            await dbContext.SaveChangesAsync();
            return orderItems;

        }

        public async Task<List<OrderItem>> GetAllByOrderAsync(int orderId)
        {
            var orderItems = await dbContext.OrderItems
                .Where(o => !o.IsDeleted && o.OrderId == orderId)
                .Include(o => o.Product).ToListAsync();

            await dbContext.SaveChangesAsync();
            return orderItems;

        }

        public async Task<OrderItem?> GetByIdAsync(int id)
        {
            var orderItem = await dbContext.OrderItems
                .Where(o => !o.IsDeleted)
                .Include(o => o.Product)
                .FirstOrDefaultAsync(orderItem => orderItem.Id == id);

            return orderItem;
        }

        public async Task<OrderItem> CreateAsync(OrderItem orderItem)
        {

            var product = dbContext.Products.FirstOrDefault(p => p.Id == orderItem.ProductId);
            if (product != null)
            {
                orderItem.Price = orderItem.Quantity * product.Price;
            }
            await dbContext.OrderItems.AddAsync(orderItem);

            await dbContext.SaveChangesAsync();

            return orderItem;
        }

        public async Task<OrderItem?> UpdateOrderItemQuantityAsync(OrderItem orderItem)
        {
            var existingOrderItem = await dbContext.OrderItems
               .Include(o => o.Product)
               .Where(o => !o.IsDeleted)
               .FirstOrDefaultAsync(o => o.Id == orderItem.Id);

            if (existingOrderItem == null)
            {
                return null;
            }
            existingOrderItem.Quantity = orderItem.Quantity;

            if (existingOrderItem.Quantity == 0)
            {
                existingOrderItem.Price = 0;
                existingOrderItem.IsDeleted = true;
            }
            else
            {
                if (existingOrderItem.Product != null)
                {
                    existingOrderItem.Price = orderItem.Quantity * existingOrderItem.Product.Price;
                }
            }

            await dbContext.SaveChangesAsync();

            return existingOrderItem;
        }


        public async Task<OrderItem?> UpdateAsync(OrderItem orderItem)
        {
            var existingOrderItem = await dbContext.OrderItems
               .Include(o => o.Product)
               .Where(o => !o.IsDeleted)
               .FirstOrDefaultAsync(o => o.Id == orderItem.Id);

            if (existingOrderItem == null)
            {
                return null;
            }
            existingOrderItem.CartId = orderItem.CartId;
            existingOrderItem.OrderId = orderItem.OrderId;


            await dbContext.SaveChangesAsync();

            return existingOrderItem;
        }

        public async Task<OrderItem?> DeleteAsync(int id)
        {
            var orderItem = await dbContext.OrderItems
                .Where(o=>!o.IsDeleted)
               .Include(o => o.Product)
               .FirstOrDefaultAsync(o => o.Id == id);

            if (orderItem != null)
            {
                orderItem.IsDeleted = true;
                await dbContext.SaveChangesAsync();
            }
            return orderItem;
        }


        public async Task<OrderItem?> Exists(int cartId, int productId)
        {
            var orderItem = await dbContext.OrderItems
                .Where(o => !o.IsDeleted)
                .FirstOrDefaultAsync(o => o.CartId == cartId && o.ProductId == productId);

            return orderItem;
        }


    }
}

