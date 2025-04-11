using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.OrderDto;
using RealEstate.Repositories;
using Stripe;
using PaymentMethod = RealEstate.Models.Domains.PaymentMethod;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        public IOrderRepository _orderRepository { get; }
        public ICartRepository _cartRepository { get; }
        public IOrderItemRepository _orderItemRepository { get; }

        public OrdersController(IOrderRepository orderRepository, ICartRepository cartRepository, IOrderItemRepository orderItemRepository) 
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _orderItemRepository = orderItemRepository;
        }

        [HttpGet]
        [Route("all")]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _orderRepository.GetAllAsync();
            return Ok(orders);
        }

        [HttpGet]
        [Route("buyer/{buyerId}")]
        public async Task<IActionResult> GetAllByBuyer(int buyerId)
        {
            var orders = await _orderRepository.GetAllByBuyerAsync(buyerId);
            return Ok(orders);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null)
                return NotFound();
            return Ok(order);
        }

        [HttpPost]
        [Route("placeOrder")]
        public async Task<IActionResult> PlaceOrder([FromBody]CreateOrderDto createOrderDto)
        {
            //int buyerId = 0;
            ////int.TryParse(User.FindFirst("UserId")?.Value, out cusId);
            //int.TryParse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value, out buyerId);

            if (createOrderDto == null)
                return BadRequest("Order cannot be null");

            //cart
            var cart = await _cartRepository.GetByBuyerIdAsync(createOrderDto.BuyerId);
            if (cart != null)
            {
                var order = new Order()
                {
                    OrderDate = DateTime.Now,
                    Status = OrderStatus.Pending,
                    TotalAmount = cart.TotalPrice,
                    IsDeleted = false,
                    BuyerId = createOrderDto.BuyerId,
                    AddressId = createOrderDto.AddressId,
                    PaymentId = createOrderDto.PaymentId,
                };

                order = await _orderRepository.CreateAsync(order);

                if (cart.OrderItems != null)
                {
                    foreach (var orderItem in cart.OrderItems)
                    {
                        orderItem.CartId = null;
                        orderItem.OrderId = order.Id;

                        await _orderItemRepository.UpdateAsync(orderItem);
                    }
                }
                return Ok(order);
            }
            return BadRequest("Cart not found!");

            //if (order == null)
            //    return BadRequest("Order cannot be null");
            //var createdOrder = await _orderRepository.CreateAsync(order);
            //return CreatedAtAction(nameof(GetById), new { id = createdOrder.Id }, createdOrder);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody]Order order)
        {
            if (id != order.Id)
                return BadRequest("Order ID mismatch");
            var updatedOrder = await _orderRepository.UpdateAsync(order);
            if (updatedOrder == null)
                return NotFound();
            return Ok(updatedOrder);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null)
                return NotFound();
            await _orderRepository.DeleteAsync(id);
            return NoContent();
        }
    }
}
