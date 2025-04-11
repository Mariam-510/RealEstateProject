using RealEstate.Models.Attributes;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Dtos.OrderItemDto
{
    public class EditOrderItemDto
    {
        [Required]
        [NonNegative]
        public int Quantity { get; set; }
    }
}
