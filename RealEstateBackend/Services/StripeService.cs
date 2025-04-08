using Stripe;

namespace RealEstate.Services
{
    public class StripeService
    {
        public async Task<PaymentIntent> CreatePaymentIntentAsync(decimal amount, string currency = "usd")
        {
            var options = new PaymentIntentCreateOptions
            {
                Amount = (long)(amount * 100), // Stripe expects cents
                Currency = currency,
                AutomaticPaymentMethods = new PaymentIntentAutomaticPaymentMethodsOptions
                {
                    Enabled = true
                }
            };
            var service = new PaymentIntentService();
            return await service.CreateAsync(options);
        }
    }

}
