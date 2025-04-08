using RealEstate.Models.Attributes;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Models.Domains
{
    public class Payment
    {
        [Key]
        public int Id { get; set; }

        [DataType(DataType.DateTime)]
        public DateTime PaidAt { get; set; } = DateTime.Now;

        [Column(TypeName = "decimal(18,2)")]
        [NonNegative]
        public decimal Amount { get; set; }

        [EnumDataType(typeof(PaymentMethod))]
        public PaymentMethod PaymentMethod { get; set; }

        public string? StripePaymentIntentId { get; set; } 
        public string? PayPalOrderId { get; set; }   

    }

    public enum PaymentMethod
    {
        PayPal,
        Stripe
    }
}
