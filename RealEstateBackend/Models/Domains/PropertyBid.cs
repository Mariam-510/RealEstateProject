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

        [Column(TypeName = "decimal(18,2)")]
        [NonNegative]
        public decimal BidAmount { get; set; }

        public DateTime Timestamp { get; set; } = DateTime.Now.AddHours(1);

        public bool IsDeleted { get; set; } = false;

        [ForeignKey("Auction")]
        public int? AuctionId { get; set; }

        public Auction? Auction { get; set; }

        [ForeignKey("Buyer")]
        public int? BuyerId { get; set; }
        public Buyer? Buyer { get; set; }
    }
}
