using RealEstate.Models.Domains;

namespace RealEstate.Models.Dtos.SubscriptionDto
{
    public class CreateSubscriptionDto
    {
        public int SubscriptionPlanId { get; set; }
        public int? PaymentId { get; set; }
    }

    public enum UserType
    {
        Seller,
        Agent
    }
}


















