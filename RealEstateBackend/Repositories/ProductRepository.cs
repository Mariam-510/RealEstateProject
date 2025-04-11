using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Bcpg.OpenPgp;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class ProductRepository : IProductRepository
    {
        public RealEstateDbContext dbcontext { get; }
        public ProductRepository(RealEstateDbContext context)
        {
            dbcontext = context;
        }
        public async Task<Product?> CreateAsync(Product product)
        {
            if (product != null)
            {
                dbcontext.Products.Add(product);
                await dbcontext.SaveChangesAsync();
                if (product.CategoryID.HasValue)
                {
                    await dbcontext.Entry(product)
                        .Reference(p => p.Category)
                        .LoadAsync();
                }

                return product;
            }

         
            return null;
        }

       public async Task<Product?> DeleteAsync(int id)
        {
            Product? Product = await dbcontext.Products.Include(C=>C.Category).Where(P => P.IsDeleted == false& P.Category.IsDeleted == false).FirstOrDefaultAsync(t => t.Id == id);
            if (Product == null)
            {
               return null;
            }

            Product.IsDeleted = true;
            await dbcontext.SaveChangesAsync();
            return Product;
        }
        public async Task<List<Product?>> GetAllProductByCategoryID(int CategoryID)
        {
            return await dbcontext.Products.Where(P => P.IsDeleted == false & P.Category.IsDeleted == false & P.CategoryID== CategoryID).ToListAsync();
        }
        public async Task<List<Product?>> GetAllAsync(string? Name = null, string? SortPrice = null, string? Category = null, string? SortQuantity = null)
        {
            var Product = dbcontext.Products.Include(p => p.Category).Where(P=>P.IsDeleted==false & P.Category.IsDeleted==false).AsQueryable();
            if (Product == null)
            {
                return null;
            }
            if (!String.IsNullOrEmpty(Name))
            {
                Product = Product.Where(p => p.Name.ToLower().Contains(Name.ToLower()));
            }
            if (!string.IsNullOrEmpty(Category))
            {
                Product = Product.Where(p => p.Category.Name.ToLower() == Category.ToLower());
            }

            if (!string.IsNullOrEmpty(SortQuantity))
            {
                switch (SortQuantity.ToLower())
                {
                    case "a":
                        Product = Product.OrderBy(p => p.Quantity);
                        break;
                    case "d":
                        Product = Product.OrderByDescending(p => p.Quantity);
                        break;
                    default:
                        Product = Product.OrderByDescending(p => p.Quantity);
                        break;
                }
            }
            else
            {
                Product = Product.OrderBy(p => p.Quantity);
            }

            if (!string.IsNullOrEmpty(SortPrice))
            {
                switch (SortPrice.ToLower())
                {
                    case "a":
                        Product = Product.OrderBy(p => p.Price);
                        break;
                    case "d":
                        Product = Product.OrderByDescending(p => p.Price);
                        break;
                    default:
                        Product = Product.OrderByDescending(p => p.Price);
                        break;
                }
            }
         
            List<Product?> result = await Product.ToListAsync();

            return result.Any() ? result : null;

        }

        public async Task<Product?> GetByIdAsync(int id)
        {
           Product product= await dbcontext.Products.Include(C => C.Category).Where(P => P.IsDeleted == false & P.Category.IsDeleted == false).FirstOrDefaultAsync(t => t.Id == id);
            if (product == null)
            {
                return null;
            }
            return product;

        }

        public async Task<Product?> UpdateAsync(int id, Product product)
        {
            Product? updatedProduct =await dbcontext.Products.Include(C => C.Category).Where(P => P.IsDeleted == false).FirstOrDefaultAsync(p => p.Id == id);
            if (updatedProduct != null)
            {
                updatedProduct.Name = product.Name;
                updatedProduct.Description = product.Description;
                updatedProduct.Price = product.Price;
                updatedProduct.IsUsed=product.IsUsed;
                updatedProduct.CategoryID = product.CategoryID;
                updatedProduct.Quantity = product.Quantity;
                updatedProduct.ImageUrl = product.ImageUrl;
                await dbcontext.SaveChangesAsync();
                return updatedProduct;
            }
            return null;
        }

        public async Task CalculateAverageRating(int? id)
        {
            var product = await dbcontext.Products
                .Include(r => r.Reviews)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (product != null)
            {
                if (product.Reviews != null)
                {
                    var activeReviews = product.Reviews.Where(p => p.IsDeleted == false).ToList();
                    if (activeReviews.Any())
                        product.AverageRating = Math.Round(activeReviews.Average(r => r.Rating), 1);
                    else
                        product.AverageRating = 0;
                }
                else
                    product.AverageRating = 0;

                await dbcontext.SaveChangesAsync();
            }
        }
    }
}
