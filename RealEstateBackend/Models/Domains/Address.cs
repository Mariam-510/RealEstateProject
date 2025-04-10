using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace RealEstate.Models.Domains
{
    public class Address
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(100)]
        public string City { get; set; }

        [Required]
        [MaxLength(100)]
        public string Street { get; set; }

        [Required]
        [MaxLength(50)]
        [DisplayName("Building Number")]
        public string BuildingNum { get; set; }

        [MaxLength(20)]
        public string Apartment { get; set; }

        [MaxLength(20)]
        public string Floor { get; set; }

        [MaxLength(15)]
        [DisplayName("Phone Number")]
        public string PhoneNum { get; set; }

        public bool IsDeleted { get; set; } = false;

        [ForeignKey("Buyer")]
        [DisplayName("Buyer")]
        public int? BuyerId { get; set; }
        public virtual Buyer? Buyer { get; set; }
    }
}
