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
        public SubscriptionPlanDto? SubscriptionPlan { get; set; }
    }
}
