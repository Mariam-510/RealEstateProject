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
using System.Transactions;
using AutoMapper;
using RealEstate.Models.Dtos.ProductStockDto;
using Microsoft.AspNetCore.Authorization;

// For more information on enabling Web API for empty projects, visit https://go.microsoft.com/fwlink/?LinkID=397860

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ProductsController : ControllerBase
    {
        public IProductRepository _ProductRepository { get; }
        public ICategoryRepository _CategoryRepository { get; }
        public IProductStockRepository productStockRepository { get; }
        public FileService _fileService { get; }

        //private readonly ReviewService _reviewService;
        private readonly IWishListRepository wishListRepository;
        private readonly IReviewRepository reviewRepository;
        private readonly IMapper mapper;

        public ProductsController(IProductRepository productRepository, ICategoryRepository categoryRepository,
            IProductStockRepository productStockRepository, FileService fileService, ReviewService reviewService,
            IWishListRepository wishListRepository, IReviewRepository reviewRepository ,IMapper mapper)
        {
            _ProductRepository = productRepository;
            _CategoryRepository = categoryRepository;
            this.productStockRepository = productStockRepository;
            _fileService = fileService;
            //_reviewService = reviewService;
            this.wishListRepository = wishListRepository;
            this.reviewRepository = reviewRepository;
            this.mapper = mapper;
        }

        [HttpPost("CreateProduct")]
        public async Task<IActionResult> CreateProduct([FromForm] ProductDTO ProductDTO)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    if (!ModelState.IsValid)
                    {
                        return BadRequest(ModelState);
                    }
                    var ProductCategoryCheck = await _CategoryRepository.GetCategoryByIdAsync(ProductDTO.CategoryID);
                    if (ProductCategoryCheck == null)
                    {
                        transactionScope.Dispose();
                        return NotFound("CategoryID not found!");
                    }
                    Product ProductModel = ProductDTO.ToProductModel();

                    ProductModel.Images = new List<string>();
                    // Handle image uploads
                    foreach (var imageFile in ProductDTO.ProductImages)
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
                        transactionScope.Dispose();
                        return BadRequest("Product creation failed.");
                    }

                    var productStocks = mapper.Map<List<ProductStock>>(ProductDTO.ProductStockFormDtos);

                    foreach (var productStock in productStocks)
                    {
                        productStock.ProductId = CreatedProduct.Id;
                        await productStockRepository.CreateAsync(productStock);
                    }

                    ProductDTOShow DispayedProduct = CreatedProduct.ToProductDTOShow();
                    if (DispayedProduct != null)
                    {
                        transactionScope.Complete();
                        return Ok(new { message = "Product created successfully!", DispayedProduct });
                    }
                    transactionScope.Dispose();
                    return BadRequest("Product creation failed.");
                }
                catch (Exception ex)
                {
                    transactionScope.Dispose();
                    return StatusCode(500, new { message = "An error occurred while processing your request." });
                }
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

                return NotFound("Empty Product List!");

            }
            List<ProductDTOShow> ProductDtoList = new List<ProductDTOShow>();

            foreach (var product in ProductModelList)
            {
                var productDto = product.ToProductDTOShow();
                productDto.AverageRating = await _ProductRepository.CalculateAverageRating(product.Id);
                productDto.NumberOfReviews = await reviewRepository.GetCountOfProductReviewsAsync(product.Id);

                ProductDtoList.Add(productDto);
            }

            if (ProductDtoList == null)
            {

                return BadRequest("Error! While Fetching Product List!");

            }


            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (int.TryParse(buyerIdStr, out int buyerId))
            {
                var favoriteProducts = await wishListRepository.GetAllProductByBuyerIDAsync(buyerId);
                if (favoriteProducts != null)
                {
                    foreach (var dto in ProductDtoList)
                    {
                        if (favoriteProducts.Any(f => f.Id == dto.Id))
                        {
                            dto.IsFavorite = true;
                        }
                    }
                }
            }

            return Ok(ProductDtoList);
        }


        [HttpGet("GetbyId/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            Product? ProductModel = await _ProductRepository.GetByIdAsync(id);
            if (ProductModel == null)
            {
                return NotFound("Product Not found !");
            }
            var ProductDto = ProductModel.ToProductDTOShow();
            ProductDto.AverageRating = await _ProductRepository.CalculateAverageRating(ProductModel.Id);
            ProductDto.NumberOfReviews = await reviewRepository.GetCountOfProductReviewsAsync(ProductModel.Id);

            if (ProductDto == null)
            {
                return BadRequest("Error! While Returning Product !");
            }


            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (int.TryParse(buyerIdStr, out int buyerId))
            {
                var favoriteProducts = await wishListRepository.GetAllProductByBuyerIDAsync(buyerId);
                if (favoriteProducts!=null && favoriteProducts.Any(f => f.Id == ProductDto.Id))
                {
                    ProductDto.IsFavorite = true;
                }
            }

            return Ok(ProductDto);

        }


        [HttpPut("UpdateProduct/{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromForm] ProductDTO ProductDTO)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    if (!ModelState.IsValid)
                    {
                        return BadRequest(ModelState);
                    }
                    Category ProductCategoryCheck = await _CategoryRepository.GetCategoryByIdAsync(ProductDTO.CategoryID);
                    if (ProductCategoryCheck == null)
                    {
                        transactionScope.Dispose();
                        return NotFound("CategoryID not found!");
                    }
                    else
                    {
                        Product ProductModel = ProductDTO.ToProductModel();
                        Product? oldProduct = await _ProductRepository.GetByIdAsync(id);
                        if (oldProduct == null)
                        {
                            transactionScope.Dispose();
                            return NotFound("Product Not found!");
                        }

                        // Replace existing images with new ones
                        if (ProductDTO.ProductImages != null && ProductDTO.ProductImages.Any())
                        {
                            // Delete all existing images
                            foreach (var oldImagePath in oldProduct.Images.ToList())
                            {
                                _fileService.DeleteFile(oldImagePath);
                            }

                            oldProduct.Images.Clear();
                            ProductModel.Images = new List<string>();

                            // Upload and add new images
                            foreach (var imageFile in ProductDTO.ProductImages)
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
                            transactionScope.Dispose();
                            return NotFound("Product Not found to Update!.");
                        }

                        var oldProductStocks = await productStockRepository.GetByProductIdAsync(UpdatedProduct.Id);

                        foreach (var productStock in oldProductStocks)
                        {
                            await productStockRepository.DeleteAsync(productStock.Id);
                        }

                        var productStocks = mapper.Map<List<ProductStock>>(ProductDTO.ProductStockFormDtos);

                        foreach (var productStock in productStocks)
                        {
                            productStock.ProductId = UpdatedProduct.Id;
                            await productStockRepository.CreateAsync(productStock);
                        }

                        ProductDTOShow DispayedProduct = UpdatedProduct.ToProductDTOShow();
                        if (DispayedProduct != null)
                        {
                            transactionScope.Complete();
                            return Ok(new { message = "Product Updated successfully!", DispayedProduct });
                        }
                        return BadRequest("Product Update failed.");
                    }
                }
                catch (Exception ex)
                {
                    transactionScope.Dispose();
                    return StatusCode(500, new { message = "An error occurred while processing your request." });
                }
            }
        }


    }
}
