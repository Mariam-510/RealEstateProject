using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.SubscriptionDto;
using RealEstate.Repositories;
using RealEstate.Services;
using System.Security.Claims;

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

        public SubscriptionsController(ISubscriptionRepository subscriptionRepository, ISubscriptionPlanRepository subscriptionPlanRepository,
            IPaymentRepository paymentRepository, ISellerRepository sellerRepository, IAgentRepository agentRepository, IMapper mapper)
        {
            _subscriptionRepository = subscriptionRepository;
            _subscriptionPlanRepository = subscriptionPlanRepository;
            _paymentRepository = paymentRepository;
            _sellerRepository = sellerRepository;
            _agentRepository = agentRepository;
            _mapper = mapper;
        }


        //Authorize admin
        [HttpGet("user")]
        [Authorize]

        public async Task<IActionResult> GetByUserId()
        {

            UserType userType;

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
                return Unauthorized("Invalid token claims.");

            int? uId = null;

            if (role == "Seller")
            {
                var seller = await _sellerRepository.GetByAccountIdAsync(userId);
                if (seller == null)
                    return NotFound("Seller not found.");
                uId = seller.Id;
                userType = UserType.Seller;
            }
            else if (role == "Agent")
            {
                var agent = await _agentRepository.GetByAccountIdAsync(userId);
                if (agent == null)
                    return NotFound("Agent not found.");
                uId = agent.Id;
                userType = UserType.Agent;
            }
            else
            {
                return Forbid("Only Sellers and Agents can create subscriptions.");
            }

            var sub = await _subscriptionRepository.GetLastByUserIdAsync((int) uId, userType);
            if (sub == null) return NotFound();

            return Ok(_mapper.Map<SubscriptionDto>(sub));
        }

        ////Authorize admin
        //[HttpGet("current/{userId}")]
        //public async Task<IActionResult> GetCurrentActive(int userId)
        //{
        //    var sub = await _subscriptionRepository.GetCurrentActiveByUserIdAsync(userId);
        //    if (sub == null) return NotFound();
        //    return Ok(_mapper.Map<SubscriptionDto>(sub));
        //}


        [HttpPost]
        [Authorize]
        public async Task<IActionResult> Create([FromBody] CreateSubscriptionDto dto)
        {

            // Get the claims from the current user
            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
                return Unauthorized("Invalid token claims.");

            int? sellerId = null;
            int? agentId = null;

            if (role == "Seller")
            {
                var seller = await _sellerRepository.GetByAccountIdAsync(userId);
                if (seller == null)
                    return NotFound("Seller not found.");
                sellerId = seller.Id;
            }
            else if (role == "Agent")
            {
                var agent = await _agentRepository.GetByAccountIdAsync(userId);
                if (agent == null)
                    return NotFound("Agent not found.");
                agentId = agent.Id;
            }
            else
            {
                return Forbid("Only Sellers and Agents can create subscriptions.");
            }

            var sub = new Subscription();
            sub.AgentId = agentId;
            sub.SellerId = sellerId;

            //switch (dto.userType)
            //{
            //    case UserType.Seller:
            //        if (await _sellerRepository.ExistsAsync(dto.UserId))
            //        {
            //            sub.SellerId = dto.UserId;
            //        }
            //        else
            //        {
            //            return BadRequest("Invalid seller id.");
            //        }
            //        break;
            //    case UserType.Agent:

            //        if (await _agentRepository.ExistsAsync(dto.UserId))
            //        {
            //            sub.AgentId = dto.UserId;
            //        }
            //        else
            //        {
            //            return BadRequest("Invalid agent id.");
            //        }
            //        break;
            //}

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
        [Authorize]
        public async Task<IActionResult> UpdateSubscription(CreateSubscriptionDto dto)
        {

            //switch (dto.userType)
            //{
            //    case UserType.Seller:

            //        if (!(await _sellerRepository.ExistsAsync(dto.UserId)))
            //        {
            //            return BadRequest("Invalid seller id.");
            //        }
            //        break;
            //    case UserType.Agent:
            //        if(!(await _agentRepository.ExistsAsync(dto.UserId)))
            //        {
            //            return BadRequest("Invalid agent id.");
            //        }
            //        break;
            //}

            UserType userType;

            var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
            var role = User.FindFirstValue(ClaimTypes.Role);

            if (string.IsNullOrEmpty(userId) || string.IsNullOrEmpty(role))
                return Unauthorized("Invalid token claims.");

            int? uId = null;

            if (role == "Seller")
            {
                var seller = await _sellerRepository.GetByAccountIdAsync(userId);
                if (seller == null)
                    return NotFound("Seller not found.");
                uId = seller.Id;
                userType = UserType.Seller;
            }
            else if (role == "Agent")
            {
                var agent = await _agentRepository.GetByAccountIdAsync(userId);
                if (agent == null)
                    return NotFound("Agent not found.");
                uId = agent.Id;
                userType = UserType.Agent;
            }
            else
            {
                return Forbid("Only Sellers and Agents can create subscriptions.");
            }

            if (!(await _subscriptionPlanRepository.ExistsAsync((dto.SubscriptionPlanId))))
            {
                return BadRequest("Invalid subscription plan.");
            }


            Payment subscriptionPayment = await _paymentRepository.GetByIdAsync(dto.PaymentId ?? 0);

            if (subscriptionPayment != null)
            {

                //var sub = await _subscriptionRepository.GetLastByUserIdAsync(dto.UserId);
                var sub = await _subscriptionRepository.GetLastByUserIdAsync((int) uId, userType);
                if (sub == null) return NotFound();

                var newPlan = await _subscriptionPlanRepository.GetByIdAsync((int)dto.SubscriptionPlanId);
                if (newPlan == null || newPlan.IsDeleted)
                    return BadRequest("Invalid subscription plan.");


                // Update available properties based on the new plan
                sub.AvailableProperties += newPlan.MaxAllowedProperties;
                sub.SubscriptionPlanId = newPlan.Id;
                sub.SubscriptionDate = DateTime.Now;

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
