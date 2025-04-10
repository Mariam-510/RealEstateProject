using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using RealEstate.Models.Attributes;

namespace RealEstate.Models.Domains
{
    public class SubscriptionPlan
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(50)]
        [MinLength(1)]
        [RegularExpression("^[a-zA-Z\\s]+$", ErrorMessage = "Subscription name must contain only letters.")]
        public string Name { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        [NonNegative]
        public decimal Price { get; set; }

        public int MaxAllowedProperties { get; set; }

        public string Description { get; set; }

        public bool IsDeleted { get; set; } = false;

        public ICollection<Subscription> Subscriptions { get; set; }
    }

    
}
