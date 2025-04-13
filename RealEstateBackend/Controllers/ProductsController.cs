using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.Product;
using RealEstate.Repositories;
using RealEstate.Services;
using RealEstate.Mapping;
using Microsoft.AspNetCore.Http.HttpResults;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        public IProductRepository _ProductRepository { get; }
        public ICategoryRepository _CategoryRepository { get; }

        public FileService _fileService { get; }

        private readonly ReviewService _reviewService;

        public ProductsController(IProductRepository productRepository, ICategoryRepository categoryRepository, FileService fileService, ReviewService reviewService)
        {
            _ProductRepository = productRepository;
            _CategoryRepository = categoryRepository;
            _fileService = fileService;
            _reviewService = reviewService;
        }

        [HttpPost("CreateProduct")]
        public async Task<IActionResult> CreateProduct([FromForm]ProductDTO ProductDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            Category ProductCategoryCheck = await _CategoryRepository.GetCategoryByIdAsync(ProductDTO.CategoryID);
            if (ProductCategoryCheck == null)
            {
                return NotFound("CategoryID not found!");
            }
            else
            {
                Product ProductModel = ProductDTO.ToProductModel();

                ProductModel.Images = new List<string>();
                //ProductModel.ImageUrl = _fileService.UploadFile("ProductImages", ProductDTO.Productimage);
                // Handle image uploads
                foreach (var imageFile in ProductDTO.Productimage)
                {
                    var imageUrl = _fileService.UploadFile("ProductImages", imageFile);
                    if (!string.IsNullOrEmpty(imageUrl))
                    {
                        ProductModel.Images.Add(imageUrl);
                    }
                }

                Product? CreatedProduct = await _ProductRepository.CreateAsync(ProductModel);
                if (CreatedProduct == null)
                {
                    return BadRequest("Product creation failed.");
                }
                ProductDTOShow DispayedProduct = CreatedProduct.ToProductDTOShow();
                if (DispayedProduct != null)
                {
                    return Ok(new { message = "Product created successfully!", DispayedProduct });
                }
                return BadRequest("Product creation failed.");
            }
        }


        [HttpDelete("DeleteProduct/{id}")]
        public async Task<IActionResult> DeleteProduct(int id)
        {

            Product? DeletedProductModel = await _ProductRepository.DeleteAsync(id);

            if (DeletedProductModel == null)
            {

                return NotFound(new { message = "Product Not fount to Delete!" });

            }
            else
            {
                ProductDTOShow DispayedProduct = DeletedProductModel.ToProductDTOShow();
                return Ok(new { message = "Product Deleted successfully!", DispayedProduct });

            }
        }


        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll(string? Name = null, string? SortPrice = null, string? Category = null, string? SortQuantity = null)
        {
           
            var ProductModelList = await _ProductRepository.GetAllAsync(Name, SortPrice, Category, SortQuantity);
            if (ProductModelList == null)
            {

                return NotFound("Empty Product List!" );

            }
            List<ProductDTOShow> ProductDtoList = new List<ProductDTOShow>();

            foreach (var product in ProductModelList)
            {
                var productDto = new ProductDTOShow
                {
                    Id = product.Id,
                    Name = product.Name,
                    Description = product.Description,
                    Price = product.Price,
                    Quantity = product.Quantity,
                    IsUsed = product.IsUsed,
                    AverageRating = _reviewService.CalculateAverageRating(product.Id),
                    NumberOfReviews = _reviewService.GetReviewCount(product.Id),
                    IsDeleted = product.IsDeleted,
                    CategoryID = product.CategoryID ?? 0,
                    CategoryName = product.Category?.Name ?? string.Empty,
                    Productimage = product.Images ?? new List<string>(),
                    DateAdded= product.DateAdded
                   
                };

                ProductDtoList.Add(productDto);

            }

            if (ProductDtoList == null)
            {

                return BadRequest("Error! While Fetching Product List!");

            }
            return Ok(new { message = "Product List is :", ProductDtoList });
        }


        [HttpGet("GetbyId/{id}")]
        public async Task<IActionResult> GetById( int id)
        {
             Product? ProductModel = await _ProductRepository.GetByIdAsync(id);
             if(ProductModel == null)
             {
               return NotFound("Product Not found !" );
             }
            else
            {
                var ProductDto = ProductModel.ToProductDTOShow();
                if (ProductDto == null)
                {
                    return BadRequest("Error! While Returning Product !");
                }
                return Ok(new { message = "Product is :", ProductDto });

            }

           
             
        }


        [HttpPut("UpdateProduct/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] ProductDTO ProductDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            Category ProductCategoryCheck = await _CategoryRepository.GetCategoryByIdAsync(ProductDTO.CategoryID);
            if (ProductCategoryCheck == null)
            {
                return NotFound("CategoryID not found!");
            }
            else
            {
                Product ProductModel = ProductDTO.ToProductModel();
                Product? oldProduct = await _ProductRepository.GetByIdAsync(id);
                if (oldProduct == null)
                {
                    return NotFound("Product Not found!");
                }

                //ProductModel.ImageUrl = _fileService.UpdateFile("ProductImages", ProductDTO.Productimage, oldProduct.ImageUrl);


                // Replace existing images with new ones
                if (ProductDTO.Productimage != null && ProductDTO.Productimage.Any())
                {
                    // Delete all existing images
                    foreach (var oldImagePath in oldProduct.Images.ToList())
                    {
                        _fileService.DeleteFile(oldImagePath);
                    }

                    oldProduct.Images.Clear();
                    ProductModel.Images = new List<string>();

                    // Upload and add new images
                    foreach (var imageFile in ProductDTO.Productimage)
                    {
                        var imageUrl = _fileService.UploadFile("ProductImages", imageFile);
                        if (!string.IsNullOrEmpty(imageUrl))
                        {
                            ProductModel.Images.Add(imageUrl);
                        }
                    }
                }

                Product? UpdatedProduct = await _ProductRepository.UpdateAsync(id, ProductModel);
                if (UpdatedProduct == null)
                {
                    return NotFound("Product Not found to Update!.");
                }
                ProductDTOShow DispayedProduct = UpdatedProduct.ToProductDTOShow();
                if (DispayedProduct != null)
                {
                    return Ok(new { message = "Product Updated successfully!", DispayedProduct });
                }
                return BadRequest("Product Update failed.");
            }
        }


    }
}
