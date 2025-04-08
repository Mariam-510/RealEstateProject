using Stripe;
using Stripe.Checkout;

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


        //Old version
        //public string CreateCheckoutSession(decimal amount, string successUrl, string cancelUrl)
        //{
        //    var options = new SessionCreateOptions
        //    {
        //        PaymentMethodTypes = new List<string> { "card" },
        //        LineItems = new List<SessionLineItemOptions>
        //    {
        //        new SessionLineItemOptions
        //        {
        //            PriceData = new SessionLineItemPriceDataOptions
        //            {
        //                Currency = "usd",
        //                UnitAmount = (long)(amount * 100),
        //                ProductData = new SessionLineItemPriceDataProductDataOptions
        //                {
        //                    Name = "Order Payment",
        //                },
        //            },
        //            Quantity = 1,
        //        },
        //    },
        //        Mode = "payment",
        //        SuccessUrl = successUrl,
        //        CancelUrl = cancelUrl,
        //    };

        //    var service = new SessionService();
        //    var session = service.Create(options);
        //    return session.Url;
        //}

        public Session CreateCheckoutSession(decimal amount, string successUrl, string cancelUrl)
        {
            var options = new SessionCreateOptions
            {
                PaymentMethodTypes = new List<string> { "card" },
                LineItems = new List<SessionLineItemOptions>
        {
            new SessionLineItemOptions
            {
                PriceData = new SessionLineItemPriceDataOptions
                {
                    Currency = "usd",
                    UnitAmount = (long)(amount * 100),
                    ProductData = new SessionLineItemPriceDataProductDataOptions
                    {
                        Name = "Order Payment",
                    },
                },
                Quantity = 1,
            },
        },
                Mode = "payment",
                SuccessUrl = successUrl,   // example: https://localhost:4200/payment-success?sessionId={CHECKOUT_SESSION_ID}
                CancelUrl = cancelUrl,
            };

            var service = new SessionService();
            var session = service.Create(options);
            return session;
        }
    }

}
