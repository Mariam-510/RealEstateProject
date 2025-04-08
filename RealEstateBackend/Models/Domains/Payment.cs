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

        //public string? PayPalOrderId { get; set; }


        [ForeignKey("Order")]
        public int? OrderId { get; set; }
        public virtual Order Order { get; set; } = null!;

        [ForeignKey("Buyer")]
        public int? BuyerId { get; set; }
        public virtual Buyer Buyer { get; set; } = null!;

    }

    public enum PaymentMethod
    {
        PayPal,
        Stripe
    }
}
