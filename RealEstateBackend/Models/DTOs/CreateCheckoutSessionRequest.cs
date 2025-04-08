namespace RealEstate.Models.Dtos
{
    public class CreateCheckoutSessionRequest
    {
        public decimal Amount { get; set; }
        public int? OrderId { get; set; }
        public int? BuyerId { get; set; }
    }
}
