using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RealEstate.Models.Attributes;
namespace RealEstate.Models.Domains
{
    public class OrderItem
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [NonNegative]
        public int Quantity { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        [NonNegative]
        public decimal Price { get; set; }

        public bool IsDeleted { get; set; } = false;

        [ForeignKey("Order")]
        public int? OrderID { get; set; }
        public virtual Order? Order { get; set; }

        [ForeignKey("Product")]
        public int? ProductID { get; set; }
        public virtual Product? Product { get; set; }
    }
}
