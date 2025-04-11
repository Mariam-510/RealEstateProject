using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.PropertyDto;
using RealEstate.Repositories;
using RealEstate.Services;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PropertyController : ControllerBase
    {
        private readonly IPropertyRepository _propertyRepo;
        private readonly IMapper _mapper;
        private readonly FileService _fileService;
        private readonly IAgentRepository _agentRepo;
        private readonly ISellerRepository _sellerRepo;
        private readonly IAuctionRepository _auctionRepo;

        public PropertyController(IPropertyRepository propertyRepo, IMapper mapper, FileService fileService,
            IAgentRepository agentRepo,ISellerRepository sellerRepo, IAuctionRepository auctionRepo)
        {
            _propertyRepo = propertyRepo;
            _mapper = mapper;
            _fileService = fileService;
            _agentRepo = agentRepo;
            _sellerRepo = sellerRepo;
            _auctionRepo = auctionRepo;
        }
        // GET: api/Property
        [HttpGet]
        public async Task<IActionResult> GetAll(
            [FromQuery] string category = null,
            [FromQuery] string status = null,
            [FromQuery] string type = null,
            [FromQuery] string searchByLocation = null) 

        {
            // Convert strings to enums (if valid)
            PropertyCategory? propertyCategory = string.IsNullOrEmpty(category) ? null : Enum.TryParse(category, true, out PropertyCategory parsedCategory) ? parsedCategory : (PropertyCategory?)null;
            PropertyStatus? propertyStatus = string.IsNullOrEmpty(status) ? null : Enum.TryParse(status, true, out PropertyStatus parsedStatus) ? parsedStatus : (PropertyStatus?)null;
            PropertyType? propertyType = string.IsNullOrEmpty(type) ? null : Enum.TryParse(type, true, out PropertyType parsedType) ? parsedType : (PropertyType?)null;

            var properties = await _propertyRepo.GetFilteredAsync(propertyCategory, propertyStatus, propertyType, searchByLocation);
            var propertyDtos = _mapper.Map<List<PropertyDto>>(properties);
            return Ok(propertyDtos);
        }


        [HttpGet("seller/{sellerId}")]
        public async Task<IActionResult> GetAllBySellerId(int sellerId)
        {
            var seller = await _sellerRepo.GetByIdAsync(sellerId);
            if (seller == null || seller.IsDeleted)
                return NotFound($"Seller with ID {sellerId} does not exist.");
            var properties = await _propertyRepo.GetAllBySellerIdAsync(sellerId);
            if (properties == null || !properties.Any())
                return NotFound($"No properties found for seller with ID {sellerId}");

            var propertyDtos = _mapper.Map<List<PropertyDto>>(properties);
            return Ok(propertyDtos);
        }


        [HttpGet("agent/{agentId}")]
        public async Task<IActionResult> GetAllByAgentId(int agentId)
        {
           
         var agent = await _agentRepo.GetByIdAsync(agentId);
         if (agent == null || agent.IsDeleted)
                return NotFound($"Agent with ID {agentId} does not exist.");

            var properties = await _propertyRepo.GetAllByAgentIdAsync(agentId);
            if (properties == null || !properties.Any())
                return NotFound($"No properties found for Agent with ID {agentId}");

            var propertyDtos = _mapper.Map<List<PropertyDto>>(properties);
            return Ok(propertyDtos);
        }


        // GET: api/Property/5
        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var property = await _propertyRepo.GetByIdAsync(id);
            if (property == null || property.IsDeleted)
                return NotFound();

            var propertyDto = _mapper.Map<PropertyDto>(property); 

            return Ok(propertyDto);
        }

        // POST: api/Property
        [HttpPost]
        public async Task<IActionResult> Create([FromForm] CreatePropertyDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);
            // Validate Agent or Seller existence
            if (createDto.AgentId != null)
            {
                var agent = await _agentRepo.GetByIdAsync(createDto.AgentId.Value);
                if (agent == null || agent.IsDeleted)
                    return NotFound($"Agent with ID {createDto.AgentId} does not exist or is deleted.");
            }
            else if (createDto.SellerId != null)
            {
                var seller = await _sellerRepo.GetByIdAsync(createDto.SellerId.Value);
                if (seller == null || seller.IsDeleted)
                    return NotFound($"Seller with ID {createDto.SellerId} does not exist or is deleted.");
            }

            var property = _mapper.Map<Property>(createDto);
            property.Type = Enum.Parse<PropertyType>(createDto.Type, true);
            property.Status = Enum.Parse<PropertyStatus>(createDto.Status, true);
            property.PropertyCategory = Enum.Parse<PropertyCategory>(createDto.PropertyCategory, true);

            property.Images = new List<string>();

            // Handle image uploads
            foreach (var imageFile in createDto.Images)
            {
                var imageUrl = _fileService.UploadFile("PropertyImages", imageFile);
                if (!string.IsNullOrEmpty(imageUrl))
                {
                    property.Images.Add(imageUrl); 
                }
            }

            await _propertyRepo.AddAsync(property);

            var propertyDto = _mapper.Map<PropertyDto>(property);
            return CreatedAtAction(nameof(GetAll), new { id = property.Id }, propertyDto);

        }

        // PUT: api/Property/5
        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] UpdatePropertyDto dto)
        {
            if (dto == null)
                return BadRequest("The dto field is required.");

            var property = await _propertyRepo.GetByIdAsync(id);
           
            if (property == null || property.IsDeleted)
                return NotFound();

            _mapper.Map(dto, property);
            // Manually set enums (DTO is string; domain is enum)
            property.Type = Enum.Parse<PropertyType>(dto.Type, true);
            property.Status = Enum.Parse<PropertyStatus>(dto.Status, true);
            property.PropertyCategory = Enum.Parse<PropertyCategory>(dto.PropertyCategory, true);

            // Replace existing images with new ones
            if (dto.Images != null && dto.Images.Any())
            {
                // Delete all existing images
                foreach (var oldImagePath in property.Images.ToList()) 
                {
                    _fileService.DeleteFile(oldImagePath);
                }

                property.Images.Clear(); 

                // Upload and add new images
                foreach (var imageFile in dto.Images)
                {
                    var imageUrl = _fileService.UploadFile("PropertyImages", imageFile);
                    if (!string.IsNullOrEmpty(imageUrl))
                    {
                        property.Images.Add(imageUrl); 
                    }
                }
            }

            await _propertyRepo.UpdateAsync(property);
            // Return updated property
            var updatedDto = _mapper.Map<PropertyDto>(property);
            return Ok(updatedDto);

           
        }

        // DELETE: api/Property/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var property = await _propertyRepo.GetByIdAsync(id);
            if (property == null || property.IsDeleted)
                return NotFound();
            // Check if an active auction is associated with this property
            var auction = await _auctionRepo.GetByProprtyIdAsync(id);
            if (auction != null && auction.Status == Status.Active && !auction.IsDeleted)
                return BadRequest("Cannot delete the property because it has an active auction.");
            property.IsDeleted = true;
            await _propertyRepo.UpdateAsync(property);
            return Ok(new { message = "Property soft-deleted successfully." }); 
        }

    
}
}
