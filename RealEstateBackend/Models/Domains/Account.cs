using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace RealEstate.Models.Domains
{
    public class Account : IdentityUser
    {
<<<<<<< Updated upstream

=======
        [DataType(DataType.DateTime)]
        public DateTime CteatedAt { get; set; } = DateTime.Now;
>>>>>>> Stashed changes
    }
}
