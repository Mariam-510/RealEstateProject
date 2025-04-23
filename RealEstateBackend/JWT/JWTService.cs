using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.JWTDto;

namespace RealEstate.JWT
{
    public class JWTService
    {
        private readonly IConfiguration configuration;

        public JWTService(IConfiguration configuration)
        {
            this.configuration = configuration;
        }
        public string CreateJWTToken(Account appUser, List<string> roles, UserClaimsDto userData)
        {
            var claims = new List<Claim>
            {
                new Claim(JwtRegisteredClaimNames.Sub, appUser.Id),
                new Claim(JwtRegisteredClaimNames.Email, appUser.Email),
                new Claim("userId", userData.UserId.ToString()),
                new Claim("firstName", userData.FirstName),
                new Claim("lastName", userData.LastName ?? string.Empty),
                new Claim("imageUrl", userData.ImageUrl ?? string.Empty),
            };

            foreach (var role in roles)
            {
                claims.Add(new Claim("roles", role));
            }

            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:Key"]));
            var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var token = new JwtSecurityToken(
                configuration["Jwt:Issuer"],
                configuration["Jwt:Audience"],
                claims,
                expires: DateTime.Now.AddHours(1),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

    }
}

