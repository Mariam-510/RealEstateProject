using RealEstate.Models.Attributes;
using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Dtos.OrderItemDto
{
    public class OrderItemDto
    {
        public int Id { get; set; }

        public int Quantity { get; set; }

        public string Color { get; set; }

        public decimal Price { get; set; }

        public bool IsDeleted { get; set; }

        public int? CartId { get; set; }

        public int? OrderId { get; set; }

        public int? ProductId { get; set; }
        
        public string? ProductName { get; set; }
        
        public string? ProductDescription { get; set; }

        public string? ProductImage { get; set; }

        public string? CategoryName { get; set; }


    }
}
