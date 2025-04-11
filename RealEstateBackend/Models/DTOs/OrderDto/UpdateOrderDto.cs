using RealEstate.Models.Domains;

namespace RealEstate.Models.DTOs.OrderDto
{
    public class UpdateOrderDto
    {
        public int Id { get; set; }
        public OrderStatus Status { get; set; }
    }
}
