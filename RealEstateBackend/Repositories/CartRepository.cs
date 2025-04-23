using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class CartRepository : ICartRepository
    {
        private readonly RealEstateDbContext _context;
        public CartRepository(RealEstateDbContext context)
        {
            _context = context;
        }

        public async Task<List<Cart>> GetAllAsync()
        {
            var carts = await _context.Carts
                .Include(c => c.SelectedAddress)
                .Include(c => c.OrderItems)
                    .ThenInclude(o => o.Product)
                .Where(c => !c.IsDeleted)
                .ToListAsync();

            // Filter OrderItems after loading
            foreach (var cart in carts)
            {
                cart.OrderItems = cart.OrderItems
                    .Where(o => !o.IsDeleted)
                    .ToList();
            }
            return carts;
        }

        public async Task<Cart> CreateAsync(Cart cart)
        {
            await _context.Carts.AddAsync(cart);
            await _context.SaveChangesAsync();

            return cart;
        }

        private async Task<Cart?> updateTotal(Cart? cart)
        {
            if (cart != null)
            {
                if (cart.OrderItems == null || cart.OrderItems.Count() == 0)
                {
                    cart.TotalPrice = 0;
                }
                else
                {
                    cart.TotalPrice = cart.OrderItems
                      .Where(oi => !oi.IsDeleted)
                      .Sum(oi => oi.Price);
                }

            }

            await _context.SaveChangesAsync();

            return cart;
        }

        public async Task<Cart?> GetByIdAsync(int id)
        {
            var cart = await _context.Carts
                .Include(c => c.SelectedAddress)
                .Include(c => c.OrderItems)
                    .ThenInclude(o => o.Product)
                .Where(c => !c.IsDeleted)
                .FirstOrDefaultAsync(c => c.Id == id);

            // Manually filter OrderItems after loading
            cart.OrderItems = cart.OrderItems
                .Where(o => !o.IsDeleted)
                .ToList();

            cart = await updateTotal(cart);

            return cart;
        }

        public async Task<Cart?> GetByBuyerIdAsync(int buyerId)
        {
            var cart = await _context.Carts
                .Include(c => c.SelectedAddress)
                .Include(c => c.OrderItems)
                    .ThenInclude(o => o.Product)
                .Where(c => !c.IsDeleted)
                .FirstOrDefaultAsync(c => c.BuyerId == buyerId);

            // Manually filter OrderItems after loading
            cart.OrderItems = cart.OrderItems
                .Where(o => !o.IsDeleted)
                .ToList();

            cart = await updateTotal(cart);

            return cart;
        }

        public async Task<Cart?> UpdateAsync(Cart cart)
        {
            var existingcart = await GetByIdAsync(cart.Id);

            if (existingcart != null)
            {
                existingcart.SelectedAddressId = cart.SelectedAddressId;
                existingcart.OrderItems = cart.OrderItems;

                existingcart = await updateTotal(existingcart); 

            }
            await _context.SaveChangesAsync();

            return existingcart;
        }

        public async Task<Cart?> DeleteAsync(int id)
        {
            var cart = await GetByIdAsync(id);
            if (cart != null)
            {
                cart.IsDeleted = true;
                await _context.SaveChangesAsync();
            }
            return cart;
        }

    }
}
