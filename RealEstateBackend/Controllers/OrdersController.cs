using System.Security.Claims;
using System.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Mapping;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.OrderItemDto;
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
        public IProductRepository _productRepository { get; }
        public IProductStockRepository ProductStockRepository { get; }

        public OrdersController(IOrderRepository orderRepository, ICartRepository cartRepository, IOrderItemRepository orderItemRepository,
            IBuyerRepository buyerRepository, IProductRepository productRepository, IProductStockRepository productStockRepository)
        {
            _orderRepository = orderRepository;
            _cartRepository = cartRepository;
            _orderItemRepository = orderItemRepository;
            _buyerRepository = buyerRepository;
            _productRepository = productRepository;
            ProductStockRepository = productStockRepository;
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
        [Route("buyer")]
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> GetAllByBuyer()
        {
            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            var existingBuyer = await _buyerRepository.GetByIdAsync(buyerId);
            if (existingBuyer == null)
                return NotFound("Buyer not found!");

            var orders = await _orderRepository.GetAllByBuyerAsync(buyerId);

            var response = orders.Select(o => o.OrderResponseDto());
            return Ok(response);
        }

        [HttpGet]
        [Route("getById/{id}")]
        [Authorize(Roles = "Buyer")]
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
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> PlaceOrder([FromBody] CreateOrderDto createOrderDto)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    string buyerIdStr = User.FindFirst("userId")?.Value;

                    if (!int.TryParse(buyerIdStr, out int buyerId))
                    {
                        return Unauthorized("Buyer not found.");
                    }

                    if (createOrderDto == null)
                        return BadRequest("Order cannot be null");

                    //cart
                    var cart = await _cartRepository.GetByBuyerIdAsync(buyerId);
                    if (cart != null)
                    {
                        var order = new Order()
                        {
                            OrderDate = DateTime.Now,
                            Status = OrderStatus.Pending,
                            SubTotal = cart.TotalPrice,
                            DeliveryFees = createOrderDto.DeliveryFees,
                            IsDeleted = false,
                            BuyerId = buyerId,
                            AddressId = createOrderDto.AddressId,
                            PaymentId = createOrderDto.PaymentId,
                        };

                        order = await _orderRepository.CreateAsync(order);

                        if (cart.OrderItems != null)
                        {
                            foreach (var orderItem in cart.OrderItems.ToList())
                            {
                                var product = await _productRepository.GetByIdAsync((int) orderItem.ProductId);

                                if (product == null)
                                {
                                    return NotFound($"Product with ID {orderItem.ProductId} not found.");
                                }

                                var productStock = await ProductStockRepository.GetByColorAsync(product.Id, orderItem.Color);
                                if (productStock == null)
                                {
                                    return BadRequest(new { message = "Color isn't available." });
                                }

                                if (orderItem.Quantity > productStock.Quantity)
                                {
                                    return BadRequest(new { message = "Quantity exceeds available stock." });
                                }

                                productStock.Quantity -= orderItem.Quantity;
                                await ProductStockRepository.UpdateAsync(productStock.Id, productStock);

                                orderItem.CartId = null;
                                orderItem.OrderId = order.Id;

                                await _orderItemRepository.UpdateAsync(orderItem);
                            }

                        }

                        await _cartRepository.UpdateAsync(cart);

                        var response = order.OrderResponseDto();

                        transactionScope.Complete();
                        return Ok(response);
                    }
                    return BadRequest("Cart not found!");

                }
                catch (Exception)
                {
                    transactionScope.Dispose();
                    return StatusCode(500, new { message = "An unexpected error occurred." });
                }
            }
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateOrderDto updateOrderDto)
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
