namespace RealEstate.Models.DTOs.PaymentDto
{
    public class StripeSessionRequest
    {
        public decimal Amount { get; set; }
        public int SelectedAddressId { get; set; }
    }
}
