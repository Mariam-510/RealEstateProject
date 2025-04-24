using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Models.Dtos.CartDto;
using RealEstate.Models.Dtos.OrderItemDto;
using RealEstate.Repositories;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CartsController : ControllerBase
    {
        public IBuyerRepository BuyerRepository { get; }
        public ICartRepository CartRepository { get; }
        public IOrderItemRepository OrderItemRepository { get; }
        public IAddressRepository AddressRepository { get; }
        public IMapper Mapper { get; }

        public CartsController(IBuyerRepository buyerRepository, ICartRepository cartRepository, IOrderItemRepository orderItemRepository,
           IAddressRepository addressRepository ,IMapper Mapper)
        {
            BuyerRepository = buyerRepository;
            CartRepository = cartRepository;
            OrderItemRepository = orderItemRepository;
            AddressRepository = addressRepository;
            this.Mapper = Mapper;
        }


        [HttpGet("{id}")]
        [Authorize(Roles ="Buyer")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var cart = await CartRepository.GetByIdAsync(id);

            if (cart == null)
            {
                return NotFound();
            }

            var cartDto = Mapper.Map<CartDto>(cart);

            return Ok(cartDto);
        }


        [HttpGet()]
        [Route("Buyer")]
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> GetByBuyerId()
        {
            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            var cart = await CartRepository.GetByBuyerIdAsync(buyerId);

            if (cart == null)
            {
                return NotFound();
            }

            var cartDto = Mapper.Map<CartDto>(cart);

            return Ok(cartDto);
        }

        [HttpPut]
        [Route("ClearCart")]
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> ClearCart()
        {
            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            var cart = await CartRepository.GetByBuyerIdAsync(buyerId);
            
            if (cart == null)
            {
                return NotFound(new { message = "Cart not found" });
            }

            if (cart.OrderItems != null && cart.OrderItems.Any())
            {
                foreach (var orderItem in cart.OrderItems)
                {
                    await OrderItemRepository.DeleteAsync(orderItem.Id);
                }

            }

            cart.OrderItems = null;
            
            cart = await CartRepository.UpdateAsync(cart);

            var cartDto = Mapper.Map<CartDto>(cart);

            return Ok(new { message = "Cart deleted", cartDto });
        }



    }
}
