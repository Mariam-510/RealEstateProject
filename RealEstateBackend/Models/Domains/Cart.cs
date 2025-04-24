using RealEstate.Models.Attributes;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Domains
{
    public class Cart
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        [NonNegative]
        public decimal TotalPrice { get; set; }

        public bool IsDeleted { get; set; } = false;

        [ForeignKey("Customer")]
        [Display(Name = "Customer")]
        public int? BuyerId { get; set; }
        public virtual Buyer? Buyer { get; set; }

        public virtual IEnumerable<OrderItem>? OrderItems { get; set; }
    }
}
