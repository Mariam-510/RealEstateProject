using RealEstate.Models.Attributes;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.PropertyBidDto
{
    public class CreatePropertyBidDto
    {
        [Required]
        [NonNegative]
        public decimal BidAmount { get; set; }

        [Required]
        public int AuctionId { get; set; }

        [Required]
        public int BuyerId { get; set; }
    }
}
