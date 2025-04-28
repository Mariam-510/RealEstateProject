using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Tokens;
using RealEstate.Models.Dtos.AccountDto;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text.Json;

namespace RealEstate.Services
{
    public class GoogleService
    {
        public IConfiguration Configuration { get; }

        public GoogleService(IConfiguration configuration)
        {
            Configuration = configuration;
        }
        public async Task<(bool isValid, IEnumerable<Claim> claims)> ValidateGoogleToken(string idToken)
        {
            try
            {
                var configurationManager = new ConfigurationManager<OpenIdConnectConfiguration>(
                    "https://accounts.google.com/.well-known/openid-configuration",
                    new OpenIdConnectConfigurationRetriever(),
                    new HttpDocumentRetriever());

                var clientId = Configuration["GoogleKeys:ClientId"];

                var openIdConfig = await configurationManager.GetConfigurationAsync();
                var validationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuers = new[] { "accounts.google.com", "https://accounts.google.com" },
                    ValidateAudience = true,
                    ValidAudience = clientId, // Now from config
                    ValidateLifetime = true,
                    IssuerSigningKeys = openIdConfig.SigningKeys,
                    ClockSkew = TimeSpan.FromMinutes(1) // Allow some clock drift
                };

                var tokenHandler = new JwtSecurityTokenHandler();
                var principal = tokenHandler.ValidateToken(idToken, validationParameters, out _);

                return (true, principal.Claims);
            }
            catch
            {
                return (false, null);
            }
        }

        public async Task<GoogleUserInfo> GetGoogleUserInfoAsync(string accessToken)
        {
            using (var httpClient = new HttpClient())
            {
                httpClient.DefaultRequestHeaders.Authorization = new System.Net.Http.Headers.AuthenticationHeaderValue("Bearer", accessToken);

                var response = await httpClient.GetAsync("https://www.googleapis.com/oauth2/v3/userinfo");

                if (!response.IsSuccessStatusCode)
                {
                    throw new Exception("Failed to fetch user info");
                }

                var jsonString = await response.Content.ReadAsStringAsync();

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true // Important because JSON uses snake_case
                };

                var userInfo = JsonSerializer.Deserialize<GoogleUserInfo>(jsonString, options);

                return userInfo;
            }
        }

    }
}
