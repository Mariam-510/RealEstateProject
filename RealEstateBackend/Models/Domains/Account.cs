using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace RealEstate.Models.Domains
{
    public class Account : IdentityUser
    {
        [DataType(DataType.DateTime)]
        public DateTime CteatedAt { get; set; } = DateTime.Now;
    }
}
