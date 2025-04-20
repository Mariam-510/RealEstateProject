
//Old version
//using Newtonsoft.Json;
//using System.Net.Http.Headers;
//using System.Text;

//namespace RealEstate.Services
//{
//    using System.Net.Http.Headers;
//    using System.Text;
//    using Microsoft.Extensions.Options;
//    using Newtonsoft.Json;
//    using RealEstate.Models;

//    public class PayPalService
//    {
//        private readonly HttpClient _httpClient;
//        private readonly PayPalSettings _settings;

//        public PayPalService(HttpClient httpClient, IOptions<PayPalSettings> options)
//        {
//            _httpClient = httpClient;
//            _settings = options.Value;
//        }

//        private async Task<string> GetAccessTokenAsync()
//        {
//            var authToken = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_settings.ClientId}:{_settings.Secret}"));
//            var request = new HttpRequestMessage(HttpMethod.Post, $"{_settings.BaseUrl}/v1/oauth2/token");
//            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authToken);
//            request.Content = new FormUrlEncodedContent(new[] {
//            new KeyValuePair<string, string>("grant_type", "client_credentials")
//        });

//            var response = await _httpClient.SendAsync(request);
//            var json = await response.Content.ReadAsStringAsync();
//            dynamic result = JsonConvert.DeserializeObject(json);
//            return result.access_token;
//        }

//        public async Task<string> CreateOrderAsync(decimal amount)
//        {
//            var accessToken = await GetAccessTokenAsync();
//            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

//            var body = new
//            {
//                intent = "CAPTURE",
//                purchase_units = new[]
//                {
//                new {
//                    amount = new {
//                        currency_code = "USD",
//                        value = amount.ToString("F2")
//                    }
//                }
//            },
//                application_context = new
//                {
//                    return_url = "https://your-site.com/paypal-success",
//                    cancel_url = "https://your-site.com/paypal-cancel"
//                }
//            };

//            var content = new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json");
//            var response = await _httpClient.PostAsync($"{_settings.BaseUrl}/v2/checkout/orders", content);
//            var json = await response.Content.ReadAsStringAsync();
//            dynamic result = JsonConvert.DeserializeObject(json);
//            return result.id;
//        }
//    }


//}


using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Text;
using static RealEstate.Controllers.PaymentsController;

using System.Net.Http.Headers;
using System.Text;
using Microsoft.Extensions.Options;
using Newtonsoft.Json;
using RealEstate.Models.Dtos;

namespace RealEstate.Services
{
    public class PayPalService
    {
        private readonly HttpClient _httpClient;
        private readonly PayPalSettings _settings;
        private readonly IConfiguration _configuration;

        public PayPalService(HttpClient httpClient, IOptions<PayPalSettings> options, IConfiguration configuration)
        {
            _httpClient = httpClient;
            _settings = options.Value;
            _configuration = configuration;
        }



    

        public async Task<string> CreateOrderAsync(decimal amount)
        {
            var accessToken = await GetAccessTokenAsync();

            var body = new
            {
                intent = "CAPTURE",
                purchase_units = new[]
                {
                    new
                    {
                        amount = new
                        {
                            currency_code = "USD",
                            value = amount.ToString("F2")
                        }
                    }
                },
                application_context = new
                {
                    return_url = "https://localhost:4200/paypal-success",
                    cancel_url = "https://localhost:4200/paypal-cancel"
                }
            };

            using var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);
            var content = new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json");

            var response = await client.PostAsync("https://api-m.sandbox.paypal.com/v2/checkout/orders", content);
            var json = await response.Content.ReadAsStringAsync();

            dynamic result = JsonConvert.DeserializeObject(json);
            return result.id;
        }

        public async Task<PayPalVerificationResult> VerifyPaymentAsync(string orderId)
        {
            var accessToken = await GetAccessTokenAsync();

            using var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var url = $"https://api-m.sandbox.paypal.com/v2/checkout/orders/{orderId}";

            var response = await client.GetAsync(url);
            if (!response.IsSuccessStatusCode)
                return new PayPalVerificationResult { IsSuccess = false };

            var content = await response.Content.ReadAsStringAsync();
            dynamic order = JsonConvert.DeserializeObject(content);

            if (order.status == "CREATED")
            {
                decimal amount = Convert.ToDecimal(order.purchase_units[0].amount.value.ToString());
                return new PayPalVerificationResult
                {
                    IsSuccess = true,
                    Amount = amount
                };
            }

            return new PayPalVerificationResult { IsSuccess = false };
        }


        private async Task<string> GetAccessTokenAsync()
        {
            var clientId = _configuration["PayPalOptions:ClientId"];
            var secret = _configuration["PayPalOptions:Secret"];
            var auth = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{clientId}:{secret}"));

            using var client = new HttpClient();
            client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Basic", auth);

            var body = new StringContent("grant_type=client_credentials", Encoding.UTF8, "application/x-www-form-urlencoded");
            var response = await client.PostAsync("https://api-m.sandbox.paypal.com/v1/oauth2/token", body);
            var json = await response.Content.ReadAsStringAsync();

            dynamic result = JsonConvert.DeserializeObject(json);
            return result.access_token;
        }

        public class PayPalVerificationResult
        {
            public bool IsSuccess { get; set; }
            public decimal Amount { get; set; }
        }

    }
}

