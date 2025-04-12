using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Models.Domains
{
    public class Subscription
    {
        [Key]
        public int Id { get; set; }    
        public int AvailableProperties { get; set; }
        public bool IsDeleted { get; set; } = false;

        [ForeignKey("Seller")]
        public int? SellerId { get; set; }
        public virtual Seller? Seller { get; set; }

        [ForeignKey("Agent")]
        public int? AgentId { get; set; }
        public virtual Agent? Agent { get; set; }

        public DateTime SubscriptionDate { get; set; } = DateTime.Now;

        [ForeignKey("Payment")]
        public int? PaymentId { get; set; }
        public virtual Payment? Payment { get; set; }


        [ForeignKey("SubscriptionPlan")]
        public int? SubscriptionPlanId { get; set; }
        public virtual SubscriptionPlan? SubscriptionPlan { get; set; }
    }

   
}
