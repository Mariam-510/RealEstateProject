using RealEstate.Models.Domains;

namespace RealEstate.Models.Dtos.SubscriptionDto
{
    public class SubscriptionDto
    {
        public int Id { get; set; }
        public int AvailableProperties { get; set; }
        public int? SubscriptionPlanId { get; set; }
        public int? SellerId { get; set; }
        public int? AgentId { get; set; }
        public int? PaymentId { get; set; }
        public DateTime SubscriptionDate { get; set; }
        public SubscriptionPlanDto.SubscriptionPlanDto? SubscriptionPlan { get; set; }
    }
}
