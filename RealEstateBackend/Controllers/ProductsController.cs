using System.Net.Http;
using System.Security.Claims;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.Product;
using RealEstate.Repositories;
using RealEstate.Services;
using RealEstate.Mapping;

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

        public ProductsController(IProductRepository P , ICategoryRepository C, FileService fileService )
        {
            _ProductRepository = P;
            _fileService = fileService;
            _CategoryRepository =C;


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
                ProductModel.ImageUrl = _fileService.UploadFile("ProductImages", ProductDTO.Productimage);
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


        [HttpGet("DeleteProduct/{id}")]
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
           
            var ProductModel = await _ProductRepository.GetAllAsync(Name, SortPrice, Category, SortQuantity);
            if (ProductModel == null)
            {

                return NotFound("Empty Product List!" );

            }
            var ProductDto = ProductModel.ToProductDTOShowList();
            if (ProductDto == null)
            {

                return BadRequest("Error! While Fetching Product List!");

            }
            return Ok(new { message = "Product List is :", ProductDto });
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


        [HttpPost("UpdateProduct/{id}")]

        public async Task<IActionResult> UpdateProduct(int id,[FromForm] ProductDTO ProductDTO)
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
                ProductModel.ImageUrl = _fileService.UpdateFile("ProductImages", ProductDTO.Productimage, oldProduct.ImageUrl);
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
