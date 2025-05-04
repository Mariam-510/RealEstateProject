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
using RealEstate.Models.DTOs.PaymentDto;
using RealEstate.Repositories;
using RealEstate.Services;
using Stripe;
using Stripe.Checkout;
using Stripe.Climate;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly PayPalService _paypalService;
        private readonly IPaymentRepository _paymentRepository;
        private readonly IOrderRepository _orderRepository;
        private readonly IAuctionBuyerRepository _auctionBuyerRepository;
        private readonly StripeService _stripeService;
        private readonly CartService _cartService;
        private readonly ShippingFeesService _shippingFeesService;
        public IMapper Mapper { get; }
        private readonly IConfiguration _configuration;

        public PaymentsController(IPaymentRepository paymentRepository, IAuctionBuyerRepository auctionBuyerRepository, PayPalService paypalService, IMapper Mapper, StripeService stripeService,CartService cartService, IConfiguration configuration, IOrderRepository orderRepository, ShippingFeesService shippingFeesService)
        {
            _paymentRepository = paymentRepository;
            _orderRepository = orderRepository;
            _auctionBuyerRepository = auctionBuyerRepository;
            _paypalService = paypalService;
            this.Mapper = Mapper;
            _stripeService = stripeService;
            _cartService = cartService;
            _shippingFeesService = shippingFeesService;

            _configuration = configuration;
        }


        [HttpPost("PayPal")]
        [Authorize]
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
                PaidAt = DateTime.Now.AddHours(1),
                BuyerId = null
            };

            payment = await _paymentRepository.AddAsync(payment);

            var paymentDto = Mapper.Map<PaymentDto>(payment);

            return Ok(paymentDto);
        }


        // PaymentsController.cs
        [HttpPost("Stripe")]
        [Authorize]
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
                PaidAt = DateTime.Now.AddHours(1),
                BuyerId = buyerId
            };

            payment = await _paymentRepository.AddAsync(payment);

            var paymentDto = Mapper.Map<PaymentDto>(payment);

            return Ok(paymentDto);
        }

        [HttpPost("Stripe/CreateSession")]
        [Authorize]
        public async Task<IActionResult> CreateStripeSession([FromBody] StripeSessionRequest request)
        {
            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            // Step 1: Create a Payment record
            var payment = new Payment
            {
                Amount = request.Amount,
                PaymentMethod = Models.Domains.PaymentMethod.Stripe,
                PaidAt = DateTime.Now.AddHours(1), // not paid yet!
                BuyerId = buyerId
            };
            payment = await _paymentRepository.AddAsync(payment);

            // Step 2: Create an Order record (you need an IOrderRepository probably)

            var deliveryFees = await _shippingFeesService.GetShippingFeesByAddressIdAsync(request.SelectedAddressId);
            var order = new RealEstate.Models.Domains.Order
            {
                BuyerId = buyerId,
                PaymentId = payment.Id,
                Status = OrderStatus.Pending, // or whatever you use
                OrderDate = DateTime.Now.AddHours(1),
                AddressId = request.SelectedAddressId,
                DeliveryFees = deliveryFees,
                SubTotal = request.Amount - deliveryFees

            };
            order = await _orderRepository.CreateAsync(order);

            // Step 3: Clear the cart and transfer items to the order
            await _cartService.ClearCart(buyerId, order.Id);

            var successUrl = $"{_configuration["ClientUrl"]}/checkout/confirmation?orderId={order.Id}";
            var cancelUrl = $"{_configuration["ClientUrl"]}/checkout/payment";

            var session = await _stripeService.CreateCheckoutSessionAsync(request.Amount, successUrl, cancelUrl);

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
        [Authorize]
        public async Task<IActionResult> VerifyStripeSession([FromBody] string sessionId)
        {
            var isValid = await _stripeService.VerifySessionAsync(sessionId);
            if (!isValid)
            {
                return BadRequest("Payment not completed");
            }

            return Ok();
        }


        [HttpPost("Stripe/CreateAuctionSession")]
        public async Task<IActionResult> CreateStripeAuctionSession([FromBody] StripeAuctionSessionRequestDto request)
        {
            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            // Check if buyer already paid for this auction
            var existingAuctionBuyer = await _auctionBuyerRepository.GetByAuctionAndBuyerIdAsync(buyerId, request.AuctionId);
            if (existingAuctionBuyer != null)
            {
                return BadRequest("You've already paid the deposit for this auction");
            }

            // Create payment record (marked as paid immediately since we're handling it here)
            var payment = new Payment
            {
                Amount = request.Amount,
                PaymentMethod = Models.Domains.PaymentMethod.Stripe,
                PaidAt = DateTime.Now,
                BuyerId = buyerId
            };
            payment = await _paymentRepository.AddAsync(payment);

            // Create auction buyer record immediately
            var auctionBuyer = new AuctionBuyer
            {
                AuctionId = request.AuctionId,
                PaymentId = payment.Id,
                BuyerId = buyerId
            };
            auctionBuyer = await _auctionBuyerRepository.CreateAsync(auctionBuyer);

            var successUrl = $"{_configuration["ClientUrl"]}/auctions/{request.AuctionId}";
            var cancelUrl = $"{_configuration["ClientUrl"]}/auctions/{request.AuctionId}";

            var session = await _stripeService.CreateCheckoutSessionAsync(request.Amount, successUrl, cancelUrl);


            return Ok(new { sessionId = session.Id });
        }






    }
}
