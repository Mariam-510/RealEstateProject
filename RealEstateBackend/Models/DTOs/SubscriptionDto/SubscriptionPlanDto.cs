using RealEstate.Models.Domains;

namespace RealEstate.Models.Dtos.SubscriptionDto
{
    public class SubscriptionPlanDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public decimal Price { get; set; }
        public int MaxAllowedProperties { get; set; }
        public string Description { get; set; }
    }
}
