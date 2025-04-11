using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RealEstate.JWT;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.AccountDto;
using RealEstate.Models.Dtos.AdminDto;
using RealEstate.Models.Dtos.ShippingDto;
using RealEstate.Repositories;
using System.Transactions;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ShippingsController : ControllerBase
    {
        public IShippingRepository ShippingRepository { get; }
        public IMapper Mapper { get; }

        public ShippingsController(IShippingRepository shippingRepository, IMapper mapper)
        {
            ShippingRepository = shippingRepository;
            Mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var shippings = await ShippingRepository.GetAllAsync();

            var shippingsDto = Mapper.Map<List<ShippingDto>>(shippings);

            return Ok(shippingsDto);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var shipping = await ShippingRepository.GetByIdAsync(id);

            if (shipping == null)
            {
                return NotFound();
            }

            var shippingDto = Mapper.Map<ShippingDto>(shipping);

            return Ok(shippingDto);
        }


        [HttpGet]
        [Route("City/{city}")]
        public async Task<IActionResult> GetByCity([FromRoute] string city)
        {
            var shipping = await ShippingRepository.GetByCityAsync(city);

            if (shipping == null)
            {
                var avgDeliveryFees = await ShippingRepository.GetAvgDeliveryFeesAsync();
                ShippingDto dummyShippingDto = new ShippingDto()
                {
                    Id = 0,
                    DeliveryFees = avgDeliveryFees,
                    City = city,
                    IsDeleted = false
                };
                return Ok(dummyShippingDto);
            }

            var shippingDto = Mapper.Map<ShippingDto>(shipping);

            return Ok(shippingDto);
        }


        [HttpPost]
        public async Task<IActionResult> Create([FromForm] ShippingFormDto shippingFormDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var isCityExist = await ShippingRepository.IsCityExistAsync(shippingFormDto.City);

            if (isCityExist)
            {
                return BadRequest(new { message = "City already exists." });
            }

            var shipping = Mapper.Map<Shipping>(shippingFormDto);

            shipping = await ShippingRepository.CreateAsync(shipping);

            if (shipping == null)
                return StatusCode(500, new { message = "An error occurred while creating" });

            var shippingDto = Mapper.Map<ShippingDto>(shipping);

            return Ok(new { message = "Created Successfully!", shippingDto });
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] ShippingFormDto shippingFormDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingshipping = await ShippingRepository.GetByIdAsync(id);

            if (existingshipping == null)
            {
                return NotFound();
            }

            var shipping = Mapper.Map<Shipping>(shippingFormDto);

            shipping = await ShippingRepository.UpdateAsync(id,shipping);

            if (shipping == null)
            {
                return NotFound();
            }

            var shippingDto = Mapper.Map<ShippingDto>(shipping);

            return Ok(new { message = "Updated Successfully!", shippingDto });
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var shipping = await ShippingRepository.DeleteAsync(id);

            if (shipping == null)
            {
                return NotFound();
            }

            var shippingDto = Mapper.Map<ShippingDto>(shipping);

            return Ok(shippingDto);
        }

    }
}