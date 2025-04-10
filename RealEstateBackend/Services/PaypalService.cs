using Newtonsoft.Json;
using System.Net.Http.Headers;
using System.Text;

namespace RealEstate.Services
{
    using System.Net.Http.Headers;
    using System.Text;
    using Microsoft.Extensions.Options;
    using Newtonsoft.Json;
    using RealEstate.Models;

    public class PayPalService
    {
        private readonly HttpClient _httpClient;
        private readonly PayPalSettings _settings;

        public PayPalService(HttpClient httpClient, IOptions<PayPalSettings> options)
        {
            _httpClient = httpClient;
            _settings = options.Value;
        }

        private async Task<string> GetAccessTokenAsync()
        {
            var authToken = Convert.ToBase64String(Encoding.UTF8.GetBytes($"{_settings.ClientId}:{_settings.Secret}"));
            var request = new HttpRequestMessage(HttpMethod.Post, $"{_settings.BaseUrl}/v1/oauth2/token");
            request.Headers.Authorization = new AuthenticationHeaderValue("Basic", authToken);
            request.Content = new FormUrlEncodedContent(new[] {
            new KeyValuePair<string, string>("grant_type", "client_credentials")
        });

            var response = await _httpClient.SendAsync(request);
            var json = await response.Content.ReadAsStringAsync();
            dynamic result = JsonConvert.DeserializeObject(json);
            return result.access_token;
        }

        public async Task<string> CreateOrderAsync(decimal amount)
        {
            var accessToken = await GetAccessTokenAsync();
            _httpClient.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", accessToken);

            var body = new
            {
                intent = "CAPTURE",
                purchase_units = new[]
                {
                new {
                    amount = new {
                        currency_code = "USD",
                        value = amount.ToString("F2")
                    }
                }
            },
                application_context = new
                {
                    return_url = "https://your-site.com/paypal-success",
                    cancel_url = "https://your-site.com/paypal-cancel"
                }
            };

            var content = new StringContent(JsonConvert.SerializeObject(body), Encoding.UTF8, "application/json");
            var response = await _httpClient.PostAsync($"{_settings.BaseUrl}/v2/checkout/orders", content);
            var json = await response.Content.ReadAsStringAsync();
            dynamic result = JsonConvert.DeserializeObject(json);
            return result.id;
        }
    }


}
