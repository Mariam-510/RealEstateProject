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
        private readonly StripeService _stripeService;
        private readonly PayPalService _paypalService;
        private readonly IPaymentRepository _paymentRepository;
        public IMapper Mapper { get; }

        public PaymentsController(StripeService stripeService, IPaymentRepository paymentRepository, PayPalService paypalService, IMapper Mapper)
        {
            _stripeService = stripeService;
            _paymentRepository = paymentRepository;
            _paypalService = paypalService;
            this.Mapper = Mapper;
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


        //---------------------------------------------------------------------------------------------------


        //Old version
        //[HttpPost("create-payment-intent")]
        //public async Task<IActionResult> CreatePaymentIntent([FromBody] decimal amount)
        //{
        //    var paymentIntent = await _stripeService.CreatePaymentIntentAsync(amount);

        //    var payment = new Payment
        //    {
        //        Amount = amount,
        //        PaymentMethod = Models.Domains.PaymentMethod.Stripe,
        //        //StripePaymentIntentId = paymentIntent.Id,
        //        PaidAt = DateTime.UtcNow,
        //    };

        //    await _paymentRepository.AddAsync(payment);

        //    return Ok(new { clientSecret = paymentIntent.ClientSecret });
        //}


        [HttpPost("create-stripe-checkout-session")]
        public async Task<IActionResult> CreateStripeCheckoutSessionAsync([FromQuery] decimal amount)
        {
            string buyerIdStr = User.FindFirst("userId")?.Value;
            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            try
            {
                var session = _stripeService.CreateCheckoutSession(
                    amount,
                    $"https://localhost:7184/api/Payments/payment-success?sessionId={{CHECKOUT_SESSION_ID}}", // Success URL                   
                    "https://localhost:7184/payment-cancelled", // Cancel URL,
                    new Dictionary<string, string>
                    {
                { "buyerId", buyerIdStr } // Store buyerId in metadata
                    }
                );

                return Ok(new { url = session.Url, sessionId = session.Id });
            }
            catch
            {
                return BadRequest("Payment was unsuccessful");
            }
        }

        [HttpGet("verify-stripe-payment")]
        public async Task<IActionResult> VerifyStripePayment([FromQuery] string sessionId)
        {
            var sessionService = new SessionService();
            var session = await sessionService.GetAsync(sessionId);

            if (session.PaymentStatus != "paid")
            {
                return BadRequest("Payment not completed");
            }

            string buyerIdStr = User.FindFirst("userId")?.Value;
            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            var amount = session.AmountTotal / 100m;

            var payment = new Payment
            {
                Amount = (decimal)amount,
                PaidAt = DateTime.UtcNow,
                PaymentMethod = Models.Domains.PaymentMethod.Stripe,
                BuyerId = buyerId
            };

            await _paymentRepository.AddAsync(payment);

            return Ok(new
            {
                success = true,
                paymentId = payment.Id,
                amount = payment.Amount
            });
        }


        [HttpGet("payment-success")]
        public async Task<IActionResult> PaymentSuccess([FromQuery] string sessionId)
        {
            var sessionService = new SessionService();
            var session = await sessionService.GetAsync(sessionId);

            // Get buyerId from metadata
            if (!session.Metadata.TryGetValue("buyerId", out string buyerIdStr) ||
                !int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found in session metadata.");
            }

            var amount = session.AmountTotal / 100m;

            var payment = new Payment
            {
                Amount = (decimal)amount,
                PaidAt = DateTime.UtcNow,
                PaymentMethod = Models.Domains.PaymentMethod.Stripe,
                BuyerId = buyerId
            };

            await _paymentRepository.AddAsync(payment);

            return Ok();
        }


        //[HttpPost("create-paypal-order")]
        //public async Task<IActionResult> CreatePayPalOrder([FromQuery] decimal amount)
        //{
        //    try
        //    {
        //        var orderId = await _paypalService.CreateOrderAsync(amount);

        //        // Assume PayPal will redirect to success URL with orderId
        //        var redirectUrl = $"https://localhost:4200/paypal-success?orderId={orderId}";
        //        return Ok(new { url = redirectUrl, orderId });
        //    }
        //    catch
        //    {
        //        return BadRequest("Failed to create PayPal order.");
        //    }
        //}

        //[HttpGet("paypal-success")]
        //public async Task<IActionResult> PayPalSuccess([FromQuery] string orderId)
        //{
        //    var result = await _paypalService.VerifyPaymentAsync(orderId);

        //    if (result.IsSuccess)
        //    {
        //        var payment = new Payment
        //        {
        //            Amount = result.Amount,
        //            PaymentMethod = Models.Domains.PaymentMethod.PayPal,
        //            PaidAt = DateTime.UtcNow,
        //            // Add orderId, buyerId, etc. if needed
        //        };

        //        await _paymentRepository.AddAsync(payment);
        //    }


        //    return Ok("Payment recorded.");
        //}



    }
}
