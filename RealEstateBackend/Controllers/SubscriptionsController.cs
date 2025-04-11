using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.SubscriptionDto;
using RealEstate.Repositories;
using RealEstate.Services;

namespace RealEstate.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubscriptionsController : ControllerBase
    {
        private readonly ISubscriptionRepository _subscriptionRepository;
        private readonly ISubscriptionPlanRepository _subscriptionPlanRepository;
        private readonly IPaymentRepository _paymentRepository;
        private readonly ISellerRepository _sellerRepository;
        private readonly IAgentRepository _agentRepository;
        private readonly IMapper _mapper;

        public SubscriptionsController(ISubscriptionRepository subscriptionRepository, ISubscriptionPlanRepository subscriptionPlanRepository, SubscriptionService subscriptionService, IPaymentRepository paymentRepository, ISellerRepository sellerRepository, IAgentRepository agentRepository, IMapper mapper)
        {
            _subscriptionRepository = subscriptionRepository;
            _subscriptionPlanRepository = subscriptionPlanRepository;
            _paymentRepository = paymentRepository;
            _sellerRepository = sellerRepository;
            _agentRepository = agentRepository;
            _mapper = mapper;
        }



        //Authorize admin

        //[HttpGet("user/{userId}")]
        //public async Task<IActionResult> GetByUserId(int userId)
        //{
        //    var subscriptions = await _subscriptionRepository.GetByUserIdAsync(userId);
        //    return Ok(_mapper.Map<IEnumerable<SubscriptionDto>>(subscriptions));
        //}

        //Authorize admin


        [HttpGet("current/{userId}")]
        public async Task<IActionResult> GetCurrentActive(int userId)
        {
            var sub = await _subscriptionRepository.GetCurrentActiveByUserIdAsync(userId);
            if (sub == null) return NotFound();
            return Ok(_mapper.Map<SubscriptionDto>(sub));
        }


        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateSubscriptionDto dto)
        {
            var sub = new Subscription();

            switch (dto.userType)
            {
                case UserType.Seller:
                    if (await _sellerRepository.ExistsAsync(dto.UserId))
                    {
                        sub.SellerId = dto.UserId;
                    }
                    else
                    {
                        return BadRequest("Invalid seller id.");
                    }
                    break;
                case UserType.Agent:

                    if (await _agentRepository.ExistsAsync(dto.UserId))
                    {
                        sub.AgentId = dto.UserId;
                    }
                    else
                    {
                        return BadRequest("Invalid agent id.");
                    }
                    break;
            }

            if (!(await _subscriptionPlanRepository.ExistsAsync((dto.SubscriptionPlanId))))
            {
                return BadRequest("Invalid subscription plan.");
            }

            var suggestedSubPlan = await _subscriptionPlanRepository.GetByIdAsync(dto.SubscriptionPlanId);
            if (suggestedSubPlan.Price > 0)
            {
                Payment subscriptionPayment = null!;

                if (dto.PaymentId.HasValue)
                {
                    subscriptionPayment = await _paymentRepository.GetByIdAsync(dto.PaymentId.Value);
                }

                if (subscriptionPayment != null)
                {
                    sub.SubscriptionPlanId = dto.SubscriptionPlanId;
                    sub.AvailableProperties = suggestedSubPlan.MaxAllowedProperties;
                    sub.PaymentId = dto.PaymentId;

                }
                else
                {
                    return BadRequest("Payment was unsuccessful");
                }
            }
            else
            {
                sub.SubscriptionPlanId = dto.SubscriptionPlanId;
                sub.AvailableProperties = suggestedSubPlan.MaxAllowedProperties;
            }
            await _subscriptionRepository.AddAsync(sub);

            return Ok("Subscription was created successfully");
        }

        [HttpPut]
        public async Task<IActionResult> UpdateSubscription(CreateSubscriptionDto dto)
        {

            switch (dto.userType)
            {
                case UserType.Seller:

                    if (!(await _sellerRepository.ExistsAsync(dto.UserId)))
                    {
                        return BadRequest("Invalid seller id.");
                    }
                    break;
                case UserType.Agent:
                    if(!(await _agentRepository.ExistsAsync(dto.UserId)))
                    {
                        return BadRequest("Invalid agent id.");
                    }
                    break;
            }

            if (!(await _subscriptionPlanRepository.ExistsAsync((dto.SubscriptionPlanId))))
            {
                return BadRequest("Invalid subscription plan.");
            }


            Payment subscriptionPayment = await _paymentRepository.GetByIdAsync(dto.PaymentId ?? 0);

            if (subscriptionPayment != null)
            {

                var sub = await _subscriptionRepository.GetLastByUserIdAsync(dto.UserId);
                if (sub == null) return NotFound();

                var newPlan = await _subscriptionPlanRepository.GetByIdAsync((int)dto.SubscriptionPlanId);
                if (newPlan == null || newPlan.IsDeleted)
                    return BadRequest("Invalid subscription plan.");


                // Update available properties based on the new plan
                sub.AvailableProperties += newPlan.MaxAllowedProperties;
                sub.SubscriptionPlanId = newPlan.Id;

                await _subscriptionRepository.UpdateAsync(sub);

                return Ok();
            }
            else
            {
                return BadRequest("Payment was unsuccessful");
            }


        }
    }

}
