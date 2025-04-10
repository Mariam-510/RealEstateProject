using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace RealEstate.Models.DTOs.AddressDto
{
    public class UpdateAddressDto
    {
        

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

      
    }
}
