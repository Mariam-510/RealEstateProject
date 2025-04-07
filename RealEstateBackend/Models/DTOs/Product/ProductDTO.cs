using RealEstate.Models.Attributes;
using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.Product
{
    public class ProductDTO
    {

        [Key]
        public int Id { get; set; }

        [Length(1, 50)]
        public string Name { get; set; }

        [Length(1, 200)]
        public string? Description { get; set; }

        [NonNegative]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        [NonNegative]
        public int Quantity { get; set; }

        public bool IsUsed { get; set; } = false;

        public bool IsDeleted { get; set; } = false;

        [ForeignKey("Category")]
        public int? CategoryID { get; set; }
        public virtual Category? Category { get; set; }

        public virtual ICollection<OrderItem>? OrderItems { get; set; }

        public virtual ICollection<Wishlist>? Wishlist { get; set; }
    }
}
