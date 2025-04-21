using RealEstate.Models.Attributes;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Models.Domains
{
    public class ProductStock
    {
        [Key]
        public int Id { get; set; }
        
        public string Color { get; set; }

        [NonNegative]
        public int Quantity { get; set; }

        public bool IsDeleted { get; set; } = false;

        [ForeignKey("Product")]
        public int? ProductId { get; set; }

        public virtual Product? Product { get; set; }

    }
}
