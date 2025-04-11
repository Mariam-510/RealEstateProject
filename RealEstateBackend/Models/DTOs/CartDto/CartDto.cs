using RealEstate.Models.Attributes;
using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Dtos.CartDto
{
    public class CartDto
    {
        public int Id { get; set; }

        public decimal TotalPrice { get; set; }

        public bool IsDeleted { get; set; } = false;

        public int? BuyerId { get; set; }

        public int? SelectedAddressId { get; set; }

        public ICollection<OrderItemDto.OrderItemDto>? OrderItemDtos { get; set; }
    }
}
