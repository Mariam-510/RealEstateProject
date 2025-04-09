using Microsoft.EntityFrameworkCore;
using Org.BouncyCastle.Math;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class CategoryResultMsg
    {

        public bool Success { get; set; }
        public string? Message { get; set; }
        public Category? Category { get; set; }

    }
    public class CategoryRepository : ICategoryRepository
    {
        public RealEstateDbContext dbcontext { get; }
        public CategoryRepository(RealEstateDbContext context)
        {
            dbcontext = context;
        }
        public async Task<CategoryResultMsg> CreateAsync(Category category)
        {
            if (category == null)
            {
                return new CategoryResultMsg
                {
                    Success = false,
                    Message = "Please Add Category Data"
                };
            }

            var exists = await dbcontext.Categories.AnyAsync(c => c.Name.Trim().ToLower() == category.Name.Trim().ToLower() && !c.IsDeleted);

            if (exists)
            {
                return new CategoryResultMsg
                {
                    Success = false,
                    Message = "Category Name already exists."
                };
            }

            dbcontext.Categories.Add(category);
            await dbcontext.SaveChangesAsync();

            return new CategoryResultMsg
            {
                Success = true,
                Category = category
            };
        }

        public async Task<Category?> DeleteAsync(int id)
        {
            Category? Category = await dbcontext.Categories.Where(C => C.IsDeleted == false).FirstOrDefaultAsync(t => t.Id == id);
            if (Category == null)
            {
                return null;
            }
            Category.IsDeleted = true;
            await dbcontext.SaveChangesAsync();
            return Category;
        }

        public async Task<Category?> GetCategoryByIdAsync(int id)
        {
            return await dbcontext.Categories.Where(C => C.IsDeleted == false).FirstOrDefaultAsync(t => t.Id == id);

        }

        public async Task<CategoryResultMsg?> UpdateAsync(int id, Category category)
        {
            Category? updatedCategory = await dbcontext.Categories.Where(P => P.IsDeleted == false).FirstOrDefaultAsync(p => p.Id == id);
            if (updatedCategory == null)
            {
                return new CategoryResultMsg
                {
                    Success = false,
                    Message = "CategoryID Not found !"
                };

            }
            var nameExists = await dbcontext.Categories.AnyAsync(c => c.Id != id && c.Name.Trim().ToLower() == category.Name.Trim().ToLower() &&c.IsDeleted==false);

            if (nameExists)
            {
                return new CategoryResultMsg
                {
                    Success = false,
                    Message = "Category Name already Exist !"
                };

            }
            updatedCategory.Name = category.Name;
            updatedCategory.ImageUrl = category.ImageUrl;
            await dbcontext.SaveChangesAsync();
            return new CategoryResultMsg
            {
                Success = true,
                Category = updatedCategory
            };
           
        }

        public async Task<List<Category?>> GetAllAsync()
        {
            return await dbcontext.Categories.Include(C => C.Products).Where(C => C.IsDeleted == false).ToListAsync();
        }
    }
}
