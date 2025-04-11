using System.Security.Claims;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Mapping;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.OrderDto;
using RealEstate.Repositories;
using Account = RealEstate.Models.Domains.Account;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        public IOrderRepository _orderRepository { get; }
        public ICartRepository _cartRepository { get; }
        public IOrderItemRepository _orderItemRepository { get; }
        public IBuyerRepository _buyerRepository { get; }

        public OrdersController(IOrderRepository orderRepository, ICartRepository cartRepository, IOrderItemRepository orderItemRepository, IBuyerRepository buyerRepository) 
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _orderItemRepository = orderItemRepository;
            _buyerRepository = buyerRepository;
        }

        [HttpGet]
        [Route("all")]
        public async Task<IActionResult> GetAll()
        {
            var orders = await _orderRepository.GetAllAsync();

            var response = orders.Select(o => o.OrderResponseDto());
            return Ok(response);
        }

        [HttpGet]
        [Route("buyer/{buyerId}")]
        public async Task<IActionResult> GetAllByBuyer(int buyerId)
        {
            var existingBuyer = await _buyerRepository.GetByIdAsync(buyerId);
            if (existingBuyer == null)
                return NotFound("Buyer not found!");

            var orders = await _orderRepository.GetAllByBuyerAsync(buyerId);

            var response = orders.Select(o => o.OrderResponseDto());
            return Ok(response);
        }

        [HttpGet]
        [Route("getById/{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var order = await _orderRepository.GetByIdAsync(id);
            if (order == null)
                return NotFound();

            var response = order.OrderResponseDto();
            return Ok(response);
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

                cart.SelectedAddressId = null;
                await _cartRepository.UpdateAsync(cart);

                var response = order.OrderResponseDto();

                return Ok(response);
            }
            return BadRequest("Cart not found!");

            //if (order == null)
            //    return BadRequest("Order cannot be null");
            //var createdOrder = await _orderRepository.CreateAsync(order);
            //return CreatedAtAction(nameof(GetById), new { id = createdOrder.Id }, createdOrder);
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody]UpdateOrderDto updateOrderDto)
        {
            var existingOrder = await _orderRepository.GetByIdAsync(updateOrderDto.Id);

            if (existingOrder == null)
            {
                return NotFound("Order not found!");
            }

            existingOrder.Status = updateOrderDto.Status;

            await _orderRepository.UpdateAsync(existingOrder);

            var response = existingOrder.OrderResponseDto();

            return Ok(response);
        }
    }
}
