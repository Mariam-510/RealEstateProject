using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;
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


        public PaymentsController(StripeService stripeService, IPaymentRepository paymentRepository, PayPalService paypalService)
        {
            _stripeService = stripeService;
            _paymentRepository = paymentRepository;
            _paypalService = paypalService;

        }

        [HttpPost("create-payment-intent")]
        public async Task<IActionResult> CreatePaymentIntent([FromBody] decimal amount)
        {
            var paymentIntent = await _stripeService.CreatePaymentIntentAsync(amount);

            var payment = new Payment
            {
                Amount = amount,
                PaymentMethod = Models.Domains.PaymentMethod.Stripe,
                //StripePaymentIntentId = paymentIntent.Id,
                PaidAt = DateTime.UtcNow,
            };

            await _paymentRepository.AddAsync(payment);

            return Ok(new { clientSecret = paymentIntent.ClientSecret });
        }

        [HttpPost("create-paypal-order")]
        public async Task<IActionResult> CreatePayPalOrder([FromBody] decimal amount)
        {
            var orderId = await _paypalService.CreateOrderAsync(amount);

            var payment = new Payment
            {
                Amount = amount,
                PaymentMethod = Models.Domains.PaymentMethod.PayPal,
                //PayPalOrderId = orderId,
                PaidAt = DateTime.UtcNow
            };

            await _paymentRepository.AddAsync(payment);

            return Ok(new { orderId });
        }

        [HttpPost("create-stripe-checkout-session")]
        public IActionResult CreateStripeCheckoutSession([FromBody] decimal amount)
        {
            var session = _stripeService.CreateCheckoutSession(
                amount,
                "https://localhost:4200/payment-success?sessionId={CHECKOUT_SESSION_ID}",
                "https://localhost:4200/payment-cancelled"
            );

            return Ok(new { url = session.Url, sessionId = session.Id });
        }

        [HttpGet("payment-success")]
        public async Task<IActionResult> PaymentSuccess([FromQuery] string sessionId)
        {
            try
            {
                //Retrieve the session from Stripe
                var sessionService = new SessionService();

                var session = await sessionService.GetAsync(sessionId);


                // Verify the payment was successful
                if (session.PaymentStatus != "paid")
                {
                    return BadRequest("Payment was not successful");
                }

                // Get the amount paid (convert back from cents to dollars)
                var amount = session.AmountTotal / 100m;

                
                var payment = new Payment
                {
                    Amount = (decimal)amount,
                    PaidAt = DateTime.UtcNow,
                    PaymentMethod = Models.Domains.PaymentMethod.Stripe,
                    //OrderId = int.Parse(session.Metadata["OrderId"]), // if stored in metadata
                    //BuyerId = int.Parse(session.Metadata["BuyerId"])   // if stored in metadata
                };

                // Save to database
                await _paymentRepository.AddAsync(payment);

                // Redirect to a success page in your Angular app
                return Redirect("https://localhost:4200/payment-success-page");
            }
            catch (Exception ex)
            {
                
                return StatusCode(500, "An error occurred while processing your payment");
            }
        }








    }
}
