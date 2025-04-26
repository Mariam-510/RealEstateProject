using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos;
using RealEstate.Models.Dtos.OrderItemDto;
using RealEstate.Models.Dtos.PaymentDto;
using RealEstate.Repositories;
using RealEstate.Services;
using Stripe;
using Stripe.Checkout;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly PayPalService _paypalService;
        private readonly IPaymentRepository _paymentRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly StripeService _stripeService;
        private readonly CartService _cartService;
        public IMapper Mapper { get; }
        private readonly IConfiguration _configuration;

        public PaymentsController(IPaymentRepository paymentRepository, PayPalService paypalService, IMapper Mapper, StripeService stripeService,CartService cartService, IConfiguration configuration, IOrderRepository orderRepository)
        {
            _paymentRepository = paymentRepository;
            _orderRepository = orderRepository;
            _paypalService = paypalService;
            this.Mapper = Mapper;
            _stripeService = stripeService;
            _cartService = cartService;

            _configuration = configuration;
        }


        [HttpPost("PayPal")]
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> CreatePayPalOrder([FromBody] decimal amount)
        {
            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            var payment = new Payment
            {
                Amount = amount,
                PaymentMethod = Models.Domains.PaymentMethod.PayPal,
                PaidAt = DateTime.Now,
                BuyerId = buyerId
            };

            payment = await _paymentRepository.AddAsync(payment);

            var paymentDto = Mapper.Map<PaymentDto>(payment);

            return Ok(paymentDto);
        }


        // PaymentsController.cs
        [HttpPost("Stripe")]
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> CreateStripePayment([FromBody] decimal amount)
        {
            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            var payment = new Payment
            {
                Amount = amount,
                PaymentMethod = Models.Domains.PaymentMethod.Stripe,
                PaidAt = DateTime.Now,
                BuyerId = buyerId
            };

            payment = await _paymentRepository.AddAsync(payment);

            var paymentDto = Mapper.Map<PaymentDto>(payment);

            return Ok(paymentDto);
        }

        [HttpPost("Stripe/CreateSession")]
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> CreateStripeSession([FromBody] decimal amount)
        {
            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            // Step 1: Create a Payment record
            var payment = new Payment
            {
                Amount = amount,
                PaymentMethod = Models.Domains.PaymentMethod.Stripe,
                PaidAt = DateTime.Now, // not paid yet!
                BuyerId = buyerId
            };
            payment = await _paymentRepository.AddAsync(payment);

            // Step 2: Create an Order record (you need an IOrderRepository probably)
            var order = new Order
            {
                BuyerId = buyerId,
                PaymentId = payment.Id,
                Status = OrderStatus.Pending, // or whatever you use
                OrderDate = DateTime.Now,
            };
            order = await _orderRepository.CreateAsync(order);

            // Step 3: Clear the cart and transfer items to the order
            await _cartService.ClearCart(buyerId, order.Id);

            var successUrl = $"{_configuration["ClientUrl"]}/checkout/confirmation";
            var cancelUrl = $"{_configuration["ClientUrl"]}/checkout/payment";

            var session = await _stripeService.CreateCheckoutSessionAsync(amount, successUrl, cancelUrl);

            return Ok(new { sessionId = session.Id });
        }


        [HttpPost("Stripe/Webhook")]
        [AllowAnonymous]
        public async Task<IActionResult> StripeWebhook()
        {
            var json = await new StreamReader(HttpContext.Request.Body).ReadToEndAsync();
            var stripeEvent = EventUtility.ConstructEvent(
                json,
                Request.Headers["Stripe-Signature"],
                _configuration["Stripe:WebhookSecret"]
            );

            if (stripeEvent.Type == "checkout.session.completed")
            {
                var session = stripeEvent.Data.Object as Session;
                // Here you could add additional processing if needed
            }

            return Ok();
        }


        [HttpPost("Stripe/VerifySession")]
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> VerifyStripeSession([FromBody] string sessionId)
        {
            var isValid = await _stripeService.VerifySessionAsync(sessionId);
            if (!isValid)
            {
                return BadRequest("Payment not completed");
            }

            return Ok();
        }







    }
}
