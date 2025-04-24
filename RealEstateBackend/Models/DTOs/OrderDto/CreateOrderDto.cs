using RealEstate.Models.Attributes;
using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.OrderDto
{
    public class CreateOrderDto
    {
        public int? PaymentId { get; set; }
        
        [Column(TypeName = "decimal(18,2)")]
        [NonNegative]
        public decimal DeliveryFees { get; set; }
        public int AddressId { get; set; }
    }
}
