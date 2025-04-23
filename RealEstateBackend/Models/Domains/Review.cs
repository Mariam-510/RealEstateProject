using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Domains
{
    public class Review
    {
        [Key]
        public int Id { get; set; }

        [Range(1, 5)]
        public double Rating { get; set; }

        [MaxLength(300)]
        public string? Comment { get; set; }

        public DateTime Date { get; set; } = DateTime.Now;

        public bool IsDeleted { get; set; } = false;


        [ForeignKey("Buyer")]
        public int? BuyerId { get; set; }
        public virtual Buyer? Buyer { get; set; }


        [ForeignKey("Product")]
        public int? ProductId { get; set; }
        public virtual Product? Product { get; set; }
    }
}
