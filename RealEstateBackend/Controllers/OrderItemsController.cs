using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.BuyerDto;
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
        public ICartRepository CartRepository { get; }
        public IProductRepository ProductRepository { get; }
        public IProductStockRepository ProductStockRepository { get; }
        public IMapper Mapper { get; }

        public OrderItemsController(IOrderItemRepository orderItemRepository, IBuyerRepository buyerRepository,
            ICartRepository cartRepository, IProductRepository productRepository,
            IProductStockRepository productStockRepository ,IMapper Mapper)
        {
            OrderItemRepository = orderItemRepository;
            BuyerRepository = buyerRepository;
            CartRepository = cartRepository;
            ProductRepository = productRepository;
            ProductStockRepository = productStockRepository;
            this.Mapper = Mapper;
        }


        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var orderItems = await OrderItemRepository.GetAllAsync();

            var orderItemsDto = Mapper.Map<List<OrderItemDto>>(orderItems);

            return Ok(orderItemsDto);
        }

        [HttpGet]
        [Route("Cart/{cartId}")]
        public async Task<IActionResult> GetAllByCart(int cartId)
        {
            var orderItems = await OrderItemRepository.GetAllByCartAsync(cartId);

            var orderItemsDto = Mapper.Map<List<OrderItemDto>>(orderItems);

            return Ok(orderItemsDto);
        }

        [HttpGet]
        [Route("Order/{orderId}")]
        public async Task<IActionResult> GetAllByOrder(int orderId)
        {
            var orderItems = await OrderItemRepository.GetAllByOrderAsync(orderId);

            var orderItemsDto = Mapper.Map<List<OrderItemDto>>(orderItems);

            return Ok(orderItemsDto);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var orderItem = await OrderItemRepository.GetByIdAsync(id);

            if (orderItem == null)
            {
                return NotFound();
            }

            var orderItemDto = Mapper.Map<OrderItemDto>(orderItem);

            return Ok(orderItemDto);
        }


        [HttpPost]
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> Create([FromBody] CreateOrderItemDto createOrderItemDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }


            var buyer = await BuyerRepository.GetByIdAsync(buyerId);
            if (buyer == null)
            {
                return NotFound("Buyer not found.");
            }

            var cart = await CartRepository.GetByBuyerIdAsync(buyer.Id);
            if (cart == null)
            {
                return NotFound("Cart not found.");
            }

            var product = await ProductRepository.GetByIdAsync(createOrderItemDto.ProductId);
            if (product == null)
            {
                return NotFound("Product not found.");
            }

            var existingOrderItem = await OrderItemRepository.Exists(cart.Id, product.Id, createOrderItemDto.Color);
            if (existingOrderItem != null)
            {
                existingOrderItem.Quantity += createOrderItemDto.Quantity;

                var productStock = await ProductStockRepository.GetByColorAsync(product.Id, createOrderItemDto.Color);
                if (productStock == null)
                {
                    return BadRequest(new { message = "Color isn't available." });
                }

                if (existingOrderItem.Quantity > productStock.Quantity)
                {
                    return BadRequest(new { message = "Quantity exceeds available stock." });
                }

                existingOrderItem = await OrderItemRepository.UpdateOrderItemQuantityAsync(existingOrderItem);

                cart = await CartRepository.GetByIdAsync((int)existingOrderItem.CartId);
                if (cart == null)
                {
                    return NotFound("Cart not found");
                }

                var orderItemDto = Mapper.Map<OrderItemDto>(existingOrderItem);

                return Ok(new { message = "Item quantity updated in cart.", orderItemDto });
            }
            else
            {
                var orderItem = Mapper.Map<OrderItem>(createOrderItemDto);

                var productStock = await ProductStockRepository.GetByColorAsync(product.Id, createOrderItemDto.Color);
                if (productStock == null)
                {
                    return BadRequest(new { message = "Color isn't available." });
                }

                if (orderItem.Quantity > productStock.Quantity)
                {
                    return BadRequest(new { message = "Quantity exceeds available stock." });
                }

                orderItem.CartId = cart.Id;
                orderItem = await OrderItemRepository.CreateAsync(orderItem);

                cart = await CartRepository.GetByIdAsync((int)orderItem.CartId);
                if (cart == null)
                {
                    return NotFound("Cart not found");
                }

                var orderItemDto = Mapper.Map<OrderItemDto>(orderItem);


                return Ok(new { message = "Item added to cart successfully!", orderItemDto });

            }
        }


        [HttpPut]
        [Route("{id}")]
        public async Task<IActionResult> Edit(int id, [FromBody] EditOrderItemDto editOrderItemDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var orderItem = await OrderItemRepository.GetByIdAsync(id);
            if (orderItem == null)
            {
                return NotFound(new { message = "Order item not found" });
            }


            var product = await ProductRepository.GetByIdAsync((int)orderItem.ProductId);
            if (product == null)
            {
                return NotFound("Product not found.");
            }

            var productStock = await ProductStockRepository.GetByColorAsync(product.Id, editOrderItemDto.Color);
            if (productStock == null)
            {
                return BadRequest(new { message = "Color isn't available." });
            }

            if (editOrderItemDto.Quantity > productStock.Quantity)
            {
                return BadRequest(new { message = "Quantity exceeds available stock." });
            }

            orderItem.Quantity = editOrderItemDto.Quantity;
            orderItem = await OrderItemRepository.UpdateOrderItemQuantityAsync(orderItem);

            if (orderItem == null)
            {
                return NotFound(new { success = false, message = "Update failed" });
            }

            var cart = await CartRepository.GetByIdAsync((int)orderItem.CartId);
            if(cart == null)
            {
                return NotFound("Cart not found");
            }

            var orderItemDto = Mapper.Map<OrderItemDto>(orderItem);

            return Ok(new { message = "Item quantity updated in cart.", orderItemDto });
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var orderItem = await OrderItemRepository.DeleteAsync(id);
            if (orderItem == null)
            {
                return NotFound();
            }

            var cart = await CartRepository.GetByIdAsync((int)orderItem.CartId);
            if (cart == null)
            {
                return NotFound("Cart not found");
            }

            var orderItemDto = Mapper.Map<OrderItemDto>(orderItem);

            return Ok(new { message = "OrderItem deleted successfully.", orderItemDto });
        }

    }
}
