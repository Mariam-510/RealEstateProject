using RealEstate.Models.Domains;

namespace RealEstate.Models.Dtos.SubscriptionDto
{
    public class SubscriptionDto
    {
        public int Id { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public int AvailableProperties { get; set; }
        public int? SubscriptionPlanId { get; set; }
<<<<<<< Updated upstream
        public SubscriptionPlanDto? SubscriptionPlan { get; set; }
=======
        public int? SellerId { get; set; }
        public int? AgentId { get; set; }
        public int? PaymentId { get; set; }
        public DateTime SubscriptionDate { get; set; }
        public SubscriptionPlanDto.SubscriptionPlanDto? SubscriptionPlan { get; set; }
>>>>>>> Stashed changes
    }
}
