using RealEstate.Models.Attributes;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Dtos.ShippingDto
{
    public class ShippingFormDto
    {
        [Required]
        public string City { get; set; }

        [Required]
        [NonNegative]
        public decimal DeliveryFees { get; set; }
    }
}
