using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Dtos.AuctionBuyerDto
{
    public class CreateAuctionBuyerDto
    {
        [Required]
        public int AuctionId { get; set; }

        [Required]
        public int PaymentId { get; set; }
    }
}
