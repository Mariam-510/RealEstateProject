using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class WishlistRepository : IWishListRepository
    {
        public RealEstateDbContext dbcontext { get; }
        public WishlistRepository(RealEstateDbContext context)
        {
            dbcontext = context;
        }
        public async Task<Wishlist?> CreateProductAsync(Wishlist wishlist)
        {
          
            if(wishlist == null)
            {
                return null;
            }
            await dbcontext.Wishlists.AddAsync(wishlist);
            await dbcontext.SaveChangesAsync();

            return wishlist;
        }

        public async Task<Wishlist?> CreatePropertyAsync(Wishlist wishlist)
        {
            if (wishlist == null)
            {
                return null;
            }
            await dbcontext.Wishlists.AddAsync(wishlist);
            await dbcontext.SaveChangesAsync();

            return wishlist;
        }

        public async Task<Wishlist?> GettByBuyerAndProductIdAsync(int productID, int BuyerID)
        {
            return await dbcontext.Wishlists
                .Include(W => W.Product)
                .Where(W => W.ProductId == productID && W.BuyerId == BuyerID)
                .FirstOrDefaultAsync();
        }
        
        public async Task<Wishlist?> GettByBuyerAndpropertyIdAsync(int PropertyID, int BuyerID)
        {
            return await dbcontext.Wishlists
                   .Include(W => W.Property)
                   .Where(W => W.PropertyId == PropertyID && W.BuyerId == BuyerID)
                   .FirstOrDefaultAsync();
        }
       
        public async Task<List<Product?>> GetAllProductByBuyerIDAsync(int BuyerID)
        {
            if (!await dbcontext.Buyers.AnyAsync(c => c.Id == BuyerID))
                return null;

            return await dbcontext.Wishlists
                .Include(W => W.Product).ThenInclude(P=>P.Category)
                .Where(W => W.IsDeleted == false && W.BuyerId == BuyerID && W.Product != null && W.Product.IsDeleted==false)
                .OrderByDescending(w => w.WishlistDateTime)
                .Select(W => W.Product)
                .ToListAsync();
        }

        public async Task<List<Property?>> GetAllPropertyByBuyerIDAsync(int BuyerID)
        {
            if (!await dbcontext.Buyers.AnyAsync(c => c.Id == BuyerID))
            {
                return null;
            }

            return await dbcontext.Wishlists
                .Include(W => W.Property).ThenInclude(P=>P.Seller)
                .Include(w => w.Property).ThenInclude(p => p.Agent)
                .Where(W => W.IsDeleted == false && W.BuyerId == BuyerID& W.Property != null && W.Property.IsDeleted == false)
                .OrderByDescending(w => w.WishlistDateTime)
                .Select(W => W.Property)
                .ToListAsync();
        }

        public async Task<Wishlist?> UpdateProductAsync(int BuyerID, int ProductID , bool isDeleted)
        {
            var Wishlist = await dbcontext.Wishlists.Where(W => W.ProductId == ProductID && W.BuyerId == BuyerID &&W.Product.IsDeleted==false).FirstOrDefaultAsync();

            if (Wishlist == null)
            {
               return null;
            }
            Wishlist.IsDeleted = isDeleted;
            Wishlist.WishlistDateTime=DateTime.Now;
            await dbcontext.SaveChangesAsync();
            return Wishlist;
        }

        public async Task<Wishlist?> UpdatePropertyAsync(int BuyerID, int propertyID, bool isDeleted)
        {
            var Wishlist = await dbcontext.Wishlists.Where(W => W.PropertyId == propertyID && W.BuyerId == BuyerID && W.Property.IsDeleted == false).FirstOrDefaultAsync();

            if (Wishlist == null)
            {
                return null;
            }
            Wishlist.IsDeleted = isDeleted;
            Wishlist.WishlistDateTime = DateTime.Now;
            await dbcontext.SaveChangesAsync();
            return Wishlist;
        }
    }
}
