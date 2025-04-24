using RealEstate.Models.Attributes;
using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.OrderDto
{
    public class OrderResponseDto
    {
        public int Id { get; set; }
        public string OrderDate { get; set; }
        public string Status { get; set; }
        public decimal SubTotal { get; set; }
        public decimal DeliveryFees { get; set; }
        public bool IsDeleted { get; set; }
        public int? BuyerId { get; set; }
        public int? AddressId { get; set; }
        public int? PaymentId { get; set; }
        public string? PaymentMethod { get; set; }
    }
}
