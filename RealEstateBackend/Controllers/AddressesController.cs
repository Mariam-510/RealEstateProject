using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.AddressDto;
using RealEstate.Repositories;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AddressesController : ControllerBase
    {
        public readonly IAddressRepository _addressRepository;
        public readonly IBuyerRepository _buyerRepository;
        private readonly IMapper _mapper;
        public AddressesController(IAddressRepository addressRepository, IBuyerRepository buyerRepository, IMapper mapper)
        {
            _addressRepository = addressRepository;
            _buyerRepository = buyerRepository;
            _mapper = mapper;
        }

        // GET: api/Address
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var addresses = await _addressRepository.GetAllAsync();
            var result = _mapper.Map<List<AddressDto>>(addresses);
            return Ok(result);
        }


        // GET: api/Address/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var address = await _addressRepository.GetByIdAsync(id);
            if (address == null)
                return NotFound("Address not found!");

            var dto = _mapper.Map<CreateAddressDto>(address); 
            return Ok(dto);
        }


        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateAddressDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            // Check if the buyer exists
            var buyer = await _buyerRepository.GetByIdAsync(dto.BuyerId);
            if (buyer == null)
            {
                return NotFound($"Buyer with ID {dto.BuyerId} not found.");
            }

            var address = _mapper.Map<Address>(dto); // Address is your domain model
            await _addressRepository.CreateAsync(address);
            var resultDto = _mapper.Map<AddressDto>(address);

            return CreatedAtAction(nameof(GetById), new { id = address.Id }, resultDto);
        }

        // PUT: api/Address/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] UpdateAddressDto updateDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var existing = await _addressRepository.GetByIdAsync(id);
            if (existing == null)
                return NotFound("Address not found!");

            _mapper.Map(updateDto, existing); 
            var updated = await _addressRepository.UpdateAsync(id, existing);

            var updatedDto = _mapper.Map<UpdateAddressDto>(updated);
            return Ok(updatedDto);
        }

        // DELETE: api/Address/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var address = await _addressRepository.GetByIdAsync(id);
            if (address == null)
                return NotFound("Address not found!");

            await _addressRepository.DeleteAsync(id);
            return Ok(new { message = "Address deleted successfully." });
        }

    }
}
