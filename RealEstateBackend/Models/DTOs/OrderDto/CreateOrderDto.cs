using RealEstate.Models.Attributes;
using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.OrderDto
{
    public class CreateOrderDto
    {
        public int PaymentId { get; set; }
        public int BuyerId { get; set; }
        public int AddressId { get; set; }
    }
}
