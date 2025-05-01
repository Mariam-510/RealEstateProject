using AutoMapper;
using Microsoft.AspNetCore.Authorization;
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


        [HttpGet]
        [Route("Buyer")]
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> GetAllByBuyer()
        {
            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }


            var addresses = await _addressRepository.GetAllByBuyerAsync(buyerId);
            var result = _mapper.Map<List<AddressDto>>(addresses);
            return Ok(result);
        }


        // GET: api/Address/5
        [HttpGet("{id}")]
        [Authorize(Roles = "Buyer,Admin")]
        public async Task<IActionResult> GetById(int id)
        {
            //string buyerIdStr = User.FindFirst("userId")?.Value;

            //if (!int.TryParse(buyerIdStr, out int buyerId))
            //{
            //    return Unauthorized("Buyer not found.");
            //}

            var address = await _addressRepository.GetByIdAsync(id);
            if (address == null)
                return NotFound("Address not found!");

            //if (address.BuyerId != buyerId)
            //{
            //    return Unauthorized("Not allowed to delete this address.");
            //}

            var dto = _mapper.Map<AddressDto>(address); 
            return Ok(dto);
        }


        [HttpPost]
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> Create([FromBody] CreateAddressDto dto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            var buyer = await _buyerRepository.GetByIdAsync(buyerId);
            if (buyer == null)
            {
                return NotFound($"Buyer with ID {buyerId} not found.");
            }

            var address = _mapper.Map<Address>(dto); // Address is your domain model
            address.BuyerId = buyerId;
            address = await _addressRepository.CreateAsync(address);
            var resultDto = _mapper.Map<AddressDto>(address);

            return Ok(resultDto);
        }

        // PUT: api/Address/5
        [HttpPut("{id}")]
        [Authorize(Roles = "Buyer")]
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
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> Delete(int id)
        {
            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            var address = await _addressRepository.GetByIdAsync(id);
            if (address == null)
                return NotFound("Address not found!");

            if(address.BuyerId != buyerId)
            {
                return Unauthorized("Not allowed to delete this address.");

            }

            await _addressRepository.DeleteAsync(id);
            return Ok(new { message = "Address deleted successfully." });
        }

    }
}
