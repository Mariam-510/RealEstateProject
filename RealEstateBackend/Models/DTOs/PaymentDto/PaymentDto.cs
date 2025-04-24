using RealEstate.Models.Attributes;
using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Dtos.PaymentDto
{
    public class PaymentDto
    {
        public int Id { get; set; }

        public string PaidAt { get; set; }

        public decimal Amount { get; set; }

        public string PaymentMethod { get; set; }

        public int? BuyerId { get; set; }
    }
}
