using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel;

namespace RealEstate.Models.DTOs.AddressDto
{
    public class CreateAddressDto
    {

        [Required]
        [MaxLength(50)]
        public string City { get; set; }

        [Required]
        public string Street { get; set; }

        [Required]
        [MaxLength(20)]
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
