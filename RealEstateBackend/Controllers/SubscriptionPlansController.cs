using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.SubscriptionPlanDto;
using RealEstate.Repositories;

namespace RealEstate.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SubscriptionPlansController : ControllerBase
    {
        private readonly ISubscriptionPlanRepository _repository;
        private readonly IMapper _mapper;

        public SubscriptionPlansController(ISubscriptionPlanRepository repository, IMapper mapper)
        {
            _repository = repository;
            _mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var plans = await _repository.GetAllAsync();
            return Ok(_mapper.Map<IEnumerable<SubscriptionPlanDto>>(plans));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var plan = await _repository.GetByIdAsync(id);
            if (plan == null) return NotFound();

            return Ok(_mapper.Map<SubscriptionPlanDto>(plan));
        }


        [HttpPost]
        [Authorize(Roles = "Admin")]

        public async Task<IActionResult> Create(CreateSubscriptionPlanDto dto)
        {
            var plan = _mapper.Map<SubscriptionPlan>(dto);
            await _repository.AddAsync(plan);
            return CreatedAtAction(nameof(GetAll), new { id = plan.Id }, plan);
        }

        [HttpPut("{id}")]
        [Authorize(Roles = "Admin")]

        public async Task<IActionResult> Update(int id, CreateSubscriptionPlanDto dto)
        {
            var plan = await _repository.GetByIdAsync(id);
            if (plan == null) return NotFound();

            _mapper.Map(dto, plan);
            await _repository.UpdateAsync(plan);
            return NoContent();
        }


        [HttpDelete("{id}")]
        [Authorize(Roles = "Admin")]

        public async Task<IActionResult> Delete(int id)
        {
            var plan = await _repository.GetByIdAsync(id);
            if (plan == null) return NotFound();

            plan.IsDeleted = true;

            await _repository.UpdateAsync(plan);
            return NoContent();
        }
    }
}
