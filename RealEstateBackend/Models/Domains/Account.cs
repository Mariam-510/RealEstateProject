using Microsoft.AspNetCore.Identity;

namespace RealEstate.Models.Domains
{
    public class Account : IdentityUser
    {
        public DateTime CteatedAt { get; set; } = DateTime.Now;
    }
}
