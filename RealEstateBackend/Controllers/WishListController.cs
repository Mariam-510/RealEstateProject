using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Mapping;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.Product;
using RealEstate.Models.DTOs.PropertyDto;
using RealEstate.Models.DTOs.Wishlist;
using RealEstate.Repositories;
using RealEstate.Services;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class WishListController : ControllerBase
    {
        public IWishListRepository _WishlistRepository { get; }
        public IBuyerRepository _BuyerRepository { get; }
        public IProductRepository _productRepository { get; }
        private readonly IMapper _mapper;

        public WishListController(IWishListRepository wishListRepository , IProductRepository productRepository, IBuyerRepository buyerRepository,IMapper mapper)
        {
            _WishlistRepository = wishListRepository;
            _productRepository = productRepository;
            _BuyerRepository = buyerRepository;
            _mapper = mapper;
        }

        [HttpPost("ToggleProductWishlist")]
        public async Task<IActionResult> ToggleProductWishlist([FromForm] WishListProductDTO wishListProductDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var Wishlist = await _WishlistRepository.GettByBuyerAndProductIdAsync(wishListProductDTO.ProductId, wishListProductDTO.BuyerId);
            var ProductFound = await _productRepository.GetByIdAsync(wishListProductDTO.ProductId);
            if (ProductFound == null)
            {
                return NotFound("Product ID Not Found !");
            }
            var BuyerFound = await _BuyerRepository.GetByIdAsync(wishListProductDTO.BuyerId);
            if (BuyerFound == null)
            {
                return NotFound("Buyer ID Not Found !");
            }
            if (Wishlist==null)
            {
               
                Wishlist wislistModel = wishListProductDTO.ToWishListProductModel();
                if (wislistModel != null && wislistModel.ProductId.HasValue && wislistModel.BuyerId.HasValue)
                {
                    await _WishlistRepository.CreateProductAsync(wislistModel);
                    return Ok("Product WishList Created Successfully");
                }
                else
                {
                    return BadRequest("Invalid Wishlist data.");
                }

            }
           
            else
            {
                bool newStatus = !Wishlist.IsDeleted;
                Wishlist Updatedwishlist= await _WishlistRepository.UpdateProductAsync(
                    Wishlist.BuyerId.Value,
                    Wishlist.ProductId.Value,
                    newStatus
                );
                if( Updatedwishlist==null )
                {
                    return BadRequest("Sorry You Can`t Update because Product is Deleted !!");
                }
                return Ok("Product WishList Found and Updated Successfully");
            }
        }


        [HttpPost("TogglePropertyWishlist")]
        public async Task<IActionResult> TogglePropertyWishlist([FromForm] WishListPropertyDTO wishListPropertyDTO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            var Wishlist = await _WishlistRepository.GettByBuyerAndpropertyIdAsync(wishListPropertyDTO.PropertyID, wishListPropertyDTO.BuyerId);
            var ProductFound = await _productRepository.GetByIdAsync(wishListPropertyDTO.PropertyID);
            if (ProductFound == null)
            {
                return NotFound("Property ID Not Found !");
            }
            var BuyerFound = await _BuyerRepository.GetByIdAsync(wishListPropertyDTO.BuyerId);
            if (BuyerFound == null)
            {
                return NotFound("Buyer ID Not Found !");
            }
            if (Wishlist == null)
            {
                Wishlist wislistModel = wishListPropertyDTO.ToWishListPropertyModel();
                if (wislistModel != null && wislistModel.PropertyId.HasValue && wislistModel.BuyerId.HasValue)
                {
                    
                    await _WishlistRepository.CreatePropertyAsync(wislistModel);
                    return Ok("Property WishList Created Successfully");
                }
                else
                {
                    return BadRequest("Invalid Wishlist data.");
                }

            }

            else
            {
                bool newStatus = !Wishlist.IsDeleted;
                Wishlist Updatedwishlist = await _WishlistRepository.UpdatePropertyAsync(
                    Wishlist.BuyerId.Value,
                    Wishlist.PropertyId.Value,
                    newStatus
                );
                if (Updatedwishlist == null)
                {
                    return BadRequest("Sorry You Can`t Update because Property is Deleted !!");
                }
                return Ok("Property WishList Found and Updated Successfully");
            }
        }


<<<<<<< Updated upstream
        [HttpGet("GetAllproductByBuyerIDAsync/{BuyerID}")]
        public async Task<IActionResult> GetAllPrductByBuyerIDAsync(int BuyerID)
=======
        [HttpGet()]
        [Route("GetAllProductByBuyerID")]
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> GetAllPrductByBuyerIDAsync()
>>>>>>> Stashed changes
        {
            List<Product>? productList = await _WishlistRepository.GetAllProductByBuyerIDAsync(BuyerID);

            if (productList == null)
            {
                return NotFound("Buyer account not found");
            }

            List<ProductDTOShow> productListDTO = productList.ToProductDTOShowList();
            return Ok(productListDTO);

        }


<<<<<<< Updated upstream
        [HttpGet("GetAllPropertyByBuyerIDAsync/{BuyerID}")]
        public async Task<IActionResult> GetAllPropertyByBuyerIDAsync(int BuyerID)
=======
        [HttpGet()]
        [Route("GetAllPropertyByBuyerID")]

        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> GetAllPropertyByBuyerIDAsync()
>>>>>>> Stashed changes
        {
            List<Property>? propertyList = await _WishlistRepository.GetAllPropertyByBuyerIDAsync(BuyerID);

            if (propertyList == null )
            {
                return NotFound("Buyer ID not found!");
            }
            //if (!propertyList.Any())
            //{
            //    return Ok("No properties found for this buyer.");
            //}
            var propertyDtos = _mapper.Map<List<PropertyDto>>(propertyList);

            return Ok(propertyDtos);
        }

    }
}
