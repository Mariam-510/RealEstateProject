using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class ProductStockRepository : IProductStockRepository
    {
        private readonly RealEstateDbContext dbContext;
        public ProductStockRepository(RealEstateDbContext dbontext)
        {
            this.dbContext = dbontext;
        }

        public async Task<List<ProductStock>> GetAllAsync()
        {
            return await dbContext.ProductStocks
                .Include(p => p.Product)
                 .Where(p => !p.IsDeleted)
                .ToListAsync();
        }

        public async Task<ProductStock?> GetByIdAsync(int id)
        {
            return await dbContext.ProductStocks
                .Include(p => p.Product)
                .Where(p => !p.IsDeleted)
                .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task<ProductStock?> GetByColorAsync(int productId, string color)
        {
            return await dbContext.ProductStocks
                .Include(p => p.Product)
                .Where(p => !p.IsDeleted)
                .FirstOrDefaultAsync(p => p.ProductId == productId && p.Color.ToLower() == color.ToLower());
        }

        public async Task<List<ProductStock>> GetByProductIdAsync(int productId)
        {
            return await dbContext.ProductStocks
                .Include(p => p.Product)
                .Where(p => !p.IsDeleted)
                .ToListAsync();
        }

        public async Task<ProductStock> CreateAsync(ProductStock productStock)
        {
            await dbContext.ProductStocks.AddAsync(productStock);
            await dbContext.SaveChangesAsync();
            return productStock;
        }

        public async Task<ProductStock?> UpdateAsync(int id, ProductStock productStock)
        {
            var existingProductStock = await dbContext.ProductStocks
                .Include(p => p.Product)
                .Where(p => !p.IsDeleted)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (existingProductStock == null)
            {
                return null;
            }
            existingProductStock.Color = productStock.Color;
            existingProductStock.Quantity = productStock.Quantity;

            await dbContext.SaveChangesAsync();
            return existingProductStock;
        }

        public async Task<ProductStock?> DeleteAsync(int id)
        {
            var existingProductStock = await dbContext.ProductStocks
                .Include(p => p.Product)
                .Where(p => !p.IsDeleted)
                .FirstOrDefaultAsync(p => p.Id == id);

            if (existingProductStock == null)
            {
                return null;
            }
            //existingProductStock.IsDeleted = true;

            dbContext.ProductStocks.Remove(existingProductStock);
            await dbContext.SaveChangesAsync();

            return existingProductStock;
        }
    }
}
