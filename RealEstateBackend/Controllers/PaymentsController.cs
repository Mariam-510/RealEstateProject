using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;
using RealEstate.Repositories;
using RealEstate.Services;
using Stripe;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PaymentsController : ControllerBase
    {
        private readonly StripeService _stripeService;
        private readonly IPaymentRepository _paymentRepository;

        public PaymentsController(StripeService stripeService, IPaymentRepository paymentRepository)
        {
            _stripeService = stripeService;
            _paymentRepository = paymentRepository;
        }

        [HttpPost("create-payment-intent")]
        public async Task<IActionResult> CreatePaymentIntent([FromBody] decimal amount)
        {
            var paymentIntent = await _stripeService.CreatePaymentIntentAsync(amount);

            var payment = new Payment
            {
                Amount = amount,
                PaymentMethod = Models.Domains.PaymentMethod.Stripe,
                StripePaymentIntentId = paymentIntent.Id,
                PaidAt = DateTime.UtcNow,
            };

            await _paymentRepository.AddAsync(payment);

            return Ok(new { clientSecret = paymentIntent.ClientSecret });
        }

    }
}
