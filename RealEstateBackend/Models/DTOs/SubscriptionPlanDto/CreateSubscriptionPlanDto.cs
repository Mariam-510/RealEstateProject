using RealEstate.Models.Attributes;
using RealEstate.Models.Domains;

namespace RealEstate.Models.Dtos.SubscriptionPlanDto
{
    public class CreateSubscriptionPlanDto
    {
        public string Name { get; set; }

        [NonNegative]
        public decimal Price { get; set; }

        [NonNegative]
        public int MaxAllowedProperties { get; set; }

        public string Description { get; set; }
    }
}
