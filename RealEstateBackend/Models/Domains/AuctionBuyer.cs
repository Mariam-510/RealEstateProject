using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Models.Domains
{
    public class AuctionBuyer
    {
        [Key]
        public int Id { get; set; }
        public DateTime Date { get; set; } = DateTime.Now.AddHours(1);
        public bool IsDeleted { get; set; } = false;

        [ForeignKey("Buyer")]
        public int? BuyerId { get; set; }
        public virtual Buyer? Buyer { get; set; }

        [ForeignKey("Auction")]
        public int? AuctionId { get; set; }
        public virtual Auction? Auction { get; set; }

        [ForeignKey("Payment")]
        public int? PaymentId { get; set; }
        public virtual Payment? Payment { get; set; }

    }
}
