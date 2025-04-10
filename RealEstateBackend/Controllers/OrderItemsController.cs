using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.OrderItemDto;
using RealEstate.Repositories;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrderItemsController : ControllerBase
    {
        public IOrderItemRepository OrderItemRepository { get; }
        public IBuyerRepository BuyerRepository { get; }
        public IMapper Mapper { get; }

        public OrderItemsController(IOrderItemRepository orderItemRepository, IBuyerRepository buyerRepository,
            IMapper Mapper)
        {
            OrderItemRepository = orderItemRepository;
            BuyerRepository = buyerRepository;
            this.Mapper = Mapper;
        }


        //[HttpPost]
        //public async Task<IActionResult> Create([FromBody] CreateOrderItemDto createOrderItemDto)
        //{
        //if (!ModelState.IsValid)
        //{
        //    return BadRequest(ModelState);
        //}

        //var buyer = await BuyerRepository.GetByIdAsync(createOrderItemDto.BuyerId);
        //if (buyer == null)
        //{
        //    return NotFound("Buyer not found.");
        //}

        //var cart = await CartRepository.GetByCustomerIdAsync(customer.Id);
        //var product = await ProductRepository.GetByIdAsync(createOrderItemDto.ProductId);

        //if (cart == null || product == null)
        //{
        //    return NotFound("Cart or Product not found.");
        //}

        //var existingOrderItem = await OrderItemRepository.Exists(cart.Id, product.Id);
        //if (existingOrderItem != null)
        //{
        //    existingOrderItem.Quantity += createOrderItemView.Quantity;
        //    existingOrderItem = await OrderItemRepository.UpdateOrderItemQuantityAsync(existingOrderItem);

        //    return Ok(new { message = "Item quantity updated in cart." });
        //}
        //else
        //{
        //    // Check if all items are from the same restaurant
        //    if (cart.OrderItems == null || cart.OrderItems.Count() == 0 || cart.OrderItems.Any(o => o.MenuItem.RestaurantId == menuItem.RestaurantId))
        //    {
        //        var orderItem = Mapper.Map<OrderItem>(createOrderItemView);
        //        orderItem.CartId = cart.Id;
        //        orderItem = await OrderItemRepository.CreateAsync(orderItem);

        //        var newOrderItem = await OrderItemRepository.GetByIdAsync(orderItem.Id);
        //        await CartRepository.UpdateRestaurantIdAsync(cart.Id, newOrderItem?.MenuItem?.RestaurantId);

        //        return Ok(new { message = "Item added to cart successfully!" });
        //    }
        //    else
        //    {
        //        return BadRequest("Can't add items from different restaurants.");
        //    }
        //}
        //}

    }
}
