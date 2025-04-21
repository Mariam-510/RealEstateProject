using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RealEstate.Models.Attributes;
namespace RealEstate.Models.Domains
{
    public class OrderItem
    {
        [Key]
        public int Id { get; set; }

        [NonNegative]
        public int Quantity { get; set; }

        public string Color { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        [NonNegative]
        public decimal Price { get; set; }

        public bool IsDeleted { get; set; } = false;

        [ForeignKey("Cart")]
        public int? CartId { get; set; }
        public virtual Cart? Cart { get; set; }

        [ForeignKey("Order")]
        public int? OrderId { get; set; }
        public virtual Order? Order { get; set; }

        [ForeignKey("Product")]
        public int? ProductId { get; set; }
        public virtual Product? Product { get; set; }

    }
}
