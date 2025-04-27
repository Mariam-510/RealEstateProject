using System.Transactions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Mapping;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.Category;
using RealEstate.Models.DTOs.Product;
using RealEstate.Repositories;
using RealEstate.Services;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoryController : ControllerBase
    {
        public ICategoryRepository _CategoryRepository { get; }
        public IProductRepository _ProductRepository { get; }
        public FileService _fileService { get; }

        public CategoryController(ICategoryRepository categoryRepository,IProductRepository productRepository, FileService fileService)
        {
            _CategoryRepository = categoryRepository;
            _fileService = fileService;
            _ProductRepository = productRepository;

        }

        [HttpPost("CreateCategory")]
        public async Task<IActionResult> CreateCategory([FromForm] CategoryDTO CategoryDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            Category CategoryModel = CategoryDTO.ToCategoryModel();
            CategoryModel.ImageUrl = _fileService.UploadFile("CategoryImages", CategoryDTO.Categoryimage);
            var CreatedCategory = await _CategoryRepository.CreateAsync(CategoryModel);
            if (!CreatedCategory.Success)
            {
                return BadRequest(new { message = CreatedCategory.Message });
            }

            CategoryDTOShow DispayedProduct = CreatedCategory.Category.ToCategoryWithoutProductListDTOShow();
            if (DispayedProduct != null)
            {
                return Ok(new { message = "Category create Successfully!", DispayedProduct });
            }
            return BadRequest("Category creation failed.");
        }


        [HttpDelete("DeleteCategory/{id}")]
        public async Task<IActionResult> DeleteCategory(int id)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    Category? FoundCategoryModel = await _CategoryRepository.GetCategoryByIdAsync(id);

                    if (FoundCategoryModel == null)
                    {
                        transactionScope.Dispose();
                        return NotFound(new { message = "Category Not fount to Delete!" });
                    }
                    else
                    {
                        List<Product> products = await _ProductRepository.GetAllProductByCategoryID(id);
                        if (products != null && products.Any())
                        {
                            foreach (var product in products)
                            {
                                await _ProductRepository.DeleteAsync(product.Id);
                            }
                        }
                        Category? DeletedCategoryModel = await _CategoryRepository.DeleteAsync(id);
                        CategoryDTOShow DispayedCategory = DeletedCategoryModel.ToCategoryWithoutProductListDTOShow();
                        transactionScope.Complete();
                        return Ok(new { message = "Category Deleted successfully!", DispayedCategory });

                    }
                }
                catch
                {
                    transactionScope.Dispose();
                    return StatusCode(500, new { message = "An error occurred while deleting the seller." });
                }
            }
        }


        [HttpGet("GetbyId/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            Category?CategoryModel = await _CategoryRepository.GetCategoryByIdAsync(id);
            if (CategoryModel == null)
            {
                return NotFound("Category Not found !");
            }
            else
            {
                CategoryDTOShow CategoryDto = CategoryModel.ToCategoryWithoutProductListDTOShow();
                if (CategoryDto == null)
                {
                    return BadRequest("Error! While Returning Category !");
                }
                return Ok(new { message = "Product is :", CategoryDto });

            }


        }
        
        
        [HttpGet("GetAllCategory")]
        public async Task<IActionResult> GetAllCategory()
        {
            var CategoryListModel = await _CategoryRepository.GetAllAsync();
            if (CategoryListModel == null)
            {
                return NotFound("Not List Empty !");
            }
          
           var CategoryDto = CategoryListModel.ToCategoryDTOShowList();
          if (CategoryDto == null)
          {
                return BadRequest("Error! While Fetching Category List!");
          }
          return Ok(new { message = "Category List is :", CategoryDto });         

        }

        
        [HttpPut("UpdateCategory/{id}")]
        public async Task<IActionResult> UpdateCategory(int id, [FromForm] CategoryDTO CategoryDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            Category CategoryModel = CategoryDTO.ToCategoryModel();
            Category? oldCategory = await _CategoryRepository.GetCategoryByIdAsync(id);
            if (oldCategory == null)
            {
                return NotFound("Category Not found!");
            }
            CategoryModel.ImageUrl = _fileService.UpdateFile("CategoryImages", CategoryDTO.Categoryimage, oldCategory.ImageUrl);
            CategoryResultMsg? UpdatedCategory = await _CategoryRepository.UpdateAsync(id, CategoryModel);
            if (!UpdatedCategory.Success)
            {
                return BadRequest(new { message = UpdatedCategory.Message });
            }
            CategoryDTOShow DispayedCategory = UpdatedCategory.Category.ToCategoryWithoutProductListDTOShow();
            if (DispayedCategory != null)
            {
                return Ok(new { message = "Category Updated successfully!", DispayedCategory });
            }
            return BadRequest("Category Update failed.");
        }

    }
}
