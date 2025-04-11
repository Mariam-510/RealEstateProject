using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Models.Domains
{
    public class Contract
    {
        [Key]
        public int Id { get; set; }

        public bool IsDeleted { get; set; } = false;


        [ForeignKey("Seller")]
        public int? SellerId { get; set; }
        public virtual Seller? Seller { get; set; }


        [ForeignKey("Property")]
        public int? PropertyId { get; set; }
        public virtual Property? Property { get; set; }

        public string ImageUrl { get; set; }
    }
}
