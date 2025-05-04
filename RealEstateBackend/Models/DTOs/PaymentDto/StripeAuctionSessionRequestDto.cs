namespace RealEstate.Models.DTOs.PaymentDto
{
    public class StripeAuctionSessionRequestDto
    {
        public decimal Amount { get; set; }
        public int AuctionId { get; set; }
    }
}
