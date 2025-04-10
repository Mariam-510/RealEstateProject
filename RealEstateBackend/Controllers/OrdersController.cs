using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Repositories;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class OrdersController : ControllerBase
    {
        public IOrderRepository _orderRepository { get; }

        public OrdersController(IOrderRepository orderRepository) 
        {
            _orderRepository = orderRepository;
        }


    }
}
