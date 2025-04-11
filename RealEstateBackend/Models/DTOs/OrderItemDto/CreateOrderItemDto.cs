using RealEstate.Models.Attributes;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Dtos.OrderItemDto
{
    public class CreateOrderItemDto
    {
        [Required]
        [NonNegative]
        public int Quantity { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Required]
        public int BuyerId { get; set; }
    }
}
