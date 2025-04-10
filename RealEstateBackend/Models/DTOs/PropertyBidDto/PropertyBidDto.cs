namespace RealEstate.Models.DTOs.PropertyBidDto
{
    public class PropertyBidDto
    {
        public int Id { get; set; }
        public decimal BidAmount { get; set; }
        public DateTime Timestamp { get; set; }

        public int? AuctionId { get; set; }
        public int? BuyerId { get; set; }

        // This will be set manually in the controller
        public string? TimeAgo { get; set; }
    }
}
