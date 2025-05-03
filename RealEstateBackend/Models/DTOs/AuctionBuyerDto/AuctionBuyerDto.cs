using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Dtos.AuctionBuyerDto
{
    public class AuctionBuyerDto
    {
        public int Id { get; set; }
        public DateTime Date { get; set; }
        public bool IsDeleted { get; set; }
        public int? BuyerId { get; set; }
        public int? AuctionId { get; set; }
        public int? PaymentId { get; set; }
    }
}
