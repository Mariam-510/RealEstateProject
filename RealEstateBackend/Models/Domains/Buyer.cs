using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Models.Domains
{
    public class Buyer
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(50)]
        [MinLength(1)]
        [RegularExpression("^[a-zA-Z\\s]+$", ErrorMessage = "Name must contain only letters.")]
        public string FirstName { get; set; }

        [MaxLength(50)]
        [MinLength(1)]
        [RegularExpression("^[a-zA-Z\\s]+$", ErrorMessage = "Name must contain only letters.")]
        public string? LastName { get; set; }

        //public string? Preferences { get; set; }

        public bool IsDeleted { get; set; } = false;


        [ForeignKey("Account")]
        public string? AccountId { get; set; }
        public virtual Account? Account { get; set; }

        public virtual ICollection<Order>? Orders { get; set; }
        
        public virtual ICollection<Wishlist>? Wishlists { get; set; }
        
        public virtual ICollection<PropertyBid>? PropertyBids { get; set; }
        
        public virtual ICollection<Appointment>? Appointments { get; set; }

        public virtual ICollection<Address>? Addresses { get; set; }
    
        public virtual ICollection<Payment>? Payments { get; set; }

    }
}
