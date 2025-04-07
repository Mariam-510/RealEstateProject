using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RealEstate.Models.Attributes;

namespace RealEstate.Models.Domains
{
    public class PropertyBid
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [Column(TypeName = "decimal(18,2)")]
        [NonNegative]
        public decimal BidAmount { get; set; }

        [Required]
        [DataType(DataType.DateTime)]
        public DateTime Timestamp { get; set; } = DateTime.Now;

        public bool IsDeleted { get; set; } = false;

        [ForeignKey("Buyer")]
        public int? BuyerId { get; set; }

        [ForeignKey("Auction")]
        public int? AuctionId { get; set; }

        public Auction? Auction { get; set; }

        public Buyer? Buyer { get; set; }
    }
}
