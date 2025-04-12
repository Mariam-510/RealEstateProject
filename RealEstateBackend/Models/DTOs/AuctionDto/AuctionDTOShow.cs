using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.Auction
{
    public class AuctionDTOShow
    {

        public int Id { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public decimal StartPrice { get; set; }
        public Status Status { get; set; }
        public int PropertyId { get; set; }
        public int? AgentId { get; set; }
        public int? SellerId { get; set; }
    }
}
