using RealEstate.Models.Attributes;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Dtos.ShippingDto
{
    public class ShippingDto
    {
        public int Id { get; set; }

        public string City { get; set; }

        public decimal DeliveryFees { get; set; }

        public bool IsDeleted { get; set; }
    }
}
