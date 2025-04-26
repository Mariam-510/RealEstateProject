using System.ComponentModel.DataAnnotations;
using RealEstate.Models.Attributes;
using RealEstate.Models.Domains;

namespace RealEstate.Models.DTOs.Auction
{
    public class AuctionDTO 
    {
        [Required]
        [FutureDate]
        public DateTime StartTime { get; set; }

        [Required]
        [FutureDate]
        public DateTime EndTime { get; set; }

        [Required]
        [NonNegative]
        public decimal StartPrice { get; set; }

        [Required]
        public int PropertyId { get; set; }
    }
}
