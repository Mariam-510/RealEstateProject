using System.ComponentModel.DataAnnotations.Schema;
using System;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Domains
{
    public class Wishlist
    {
        [Key]
        public int Id { get; set; }

        [DataType(DataType.DateTime)]
        public DateTime WishlistDateTime { get; set; }

        public bool IsDeleted { get; set; } = false;

        [ForeignKey("Buyer")]
        public int? BuyerId { get; set; }
        public virtual Buyer? Buyer { get; set; }

        [ForeignKey("Property")]
        public int? PropertyId { get; set; }
        public virtual Property? Property { get; set; }

        [ForeignKey("Product")]
        public int? ProductId { get; set; }
        public virtual Product? Product { get; set; }
    }
}
