using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.EmailDto;
using RealEstate.Models.Dtos.SubscriptionDto;
using RealEstate.Models.DTOs.PropertyDto;
using RealEstate.Repositories;
using RealEstate.Services;
using System.Transactions;

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
        private readonly IContractRepository _contractRepo;
        private readonly ISubscriptionRepository _subscriptionRepo;
        private readonly IWishListRepository wishListRepository;
        private readonly EmailService _emailService;
        public PropertyController(IPropertyRepository propertyRepo, IMapper mapper, FileService fileService, EmailService emailService,
            IAgentRepository agentRepo, ISellerRepository sellerRepo, IAuctionRepository auctionRepo, IContractRepository contractRepo,
            ISubscriptionRepository subscriptionRepo, IWishListRepository wishListRepository )
        {
            _propertyRepo = propertyRepo;
            _mapper = mapper;
            _fileService = fileService;
            _agentRepo = agentRepo;
            _sellerRepo = sellerRepo;
            _auctionRepo = auctionRepo;
            _contractRepo = contractRepo;
            _subscriptionRepo = subscriptionRepo;
            this.wishListRepository = wishListRepository;
            _emailService = emailService;
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
            foreach (var dto in propertyDtos)
            {
                var contract = await _contractRepo.GetByPropertyIdAsync(dto.Id);
                if (contract != null)
                {
                    dto.ContractImgUrl = contract.ImageUrl;
                }
            }

            //var favoriteProperties = await wishListRepository.GetAllPropertyByBuyerIDAsync(1);
            //foreach (var dto in propertyDtos)
            //{
            //    if (favoriteProperties.Any(f => f.Id == dto.Id))
            //    {
            //        dto.IsFavorite = true;
            //    }
            //}

            return Ok(propertyDtos);
        }


        [HttpGet("Pending")]
        public async Task<IActionResult> GetPendingProperties()
        {
            try
            {

                var PendingProperties = await _propertyRepo.GetAllPending();
                if (PendingProperties == null )
                    return NotFound("There are no properties that are Pending.");
                var PendingPropertyDto = _mapper.Map<List<PropertyDto>>(PendingProperties);
                foreach (var dto in PendingPropertyDto)
                {
                    var contract = await _contractRepo.GetByPropertyIdAsync(dto.Id);
                    if (contract != null)
                    {
                        dto.ContractImgUrl = contract.ImageUrl;
                    }
                }

                //var favoriteProperties = await wishListRepository.GetAllPropertyByBuyerIDAsync(1);
                //foreach (var dto in PendingPropertyDto)
                //{
                //    if (favoriteProperties.Any(f => f.Id == dto.Id))
                //    {
                //        dto.IsFavorite = true;
                //    }
                //}

                return Ok(PendingPropertyDto); 

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error while fetching Pending properties: {ex.Message}");
            }
        }

        [HttpGet("seller/{sellerId}")]
        public async Task<IActionResult> GetAllBySellerId(int sellerId, [FromQuery] PropertyApprovalStatus? Status = null)
        {
            var seller = await _sellerRepo.GetByIdAsync(sellerId);
            if (seller == null || seller.IsDeleted)
                return NotFound($"Seller with ID {sellerId} does not exist.");
            // Fetch properties based on approval status
            List<Property> filteredProperties = new List<Property>();

            if (Status.HasValue)
            {
                if (Status == PropertyApprovalStatus.Approved)
                {
                    filteredProperties = await _propertyRepo.GetApprovedBySellerIdAsync(sellerId);
                }
                else if (Status == PropertyApprovalStatus.Pending)
                {
                    filteredProperties = await _propertyRepo.GetPendingBySellerIdAsync(sellerId);
                }
                else if (Status == PropertyApprovalStatus.Rejected)
                {
                    filteredProperties = await _propertyRepo.GetRejectedBySellerIdAsync(sellerId);
                }
            }
            else
            {
                filteredProperties = await _propertyRepo.GetAllBySellerIdAsync(sellerId);
            }
            // Check if no properties match the filter
            if (!filteredProperties.Any())
            {
                return NotFound("No properties found matching the specified criteria.");
            }
            var propertyDtos = _mapper.Map<List<PropertyDto>>(filteredProperties);
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

            //var favoriteProperties = await wishListRepository.GetAllPropertyByBuyerIDAsync(1);
            //if (favoriteProperties.Any(f => f.Id == propertyDto.Id))
            //{
            //    propertyDto.IsFavorite = true;
            //}

            return Ok(propertyDto);
        }


        // POST: api/Property
        [HttpPost("Add")]
        [Authorize(Roles = "Seller,Agent")]
        public async Task<IActionResult> Create([FromForm] CreatePropertyDto createDto)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    if (!ModelState.IsValid)
                        return BadRequest(ModelState);

                    if (createDto.Images == null || createDto.Images.Count < 2)
                    {
                        return BadRequest("At least two images are required.");
                    }

                    string userIdStr = User.FindFirst("userId")?.Value;

                    if (!int.TryParse(userIdStr, out int userId))
                        return Unauthorized("User not found.");

                    if (User.IsInRole("Seller"))
                    {
                        var seller = await _sellerRepo.GetByIdAsync(userId);
                        if (seller == null || seller.IsDeleted)
                            return NotFound($"Seller with ID {userId} does not exist or is deleted!");

                        bool availablePropertiesFlag = await _subscriptionRepo.CanAddMorePropertiesAsync(userId, UserType.Seller);
                        if (!availablePropertiesFlag)
                            return StatusCode(403, "Subscription limit reached. Please upgrade your plan.");
                    }
                    else
                    {
                        var agent = await _agentRepo.GetByIdAsync(userId);
                        if (agent == null || agent.IsDeleted)
                            return NotFound($"Agent with ID {userId} does not exist or is deleted!");

                        bool availablePropertiesFlag = await _subscriptionRepo.DecreaseAvailablePropertiesByOne(userId, UserType.Agent);
                        if (!availablePropertiesFlag)
                            return StatusCode(403, "Subscription limit reached. Please upgrade your plan.");
                    }

                    var property = _mapper.Map<Property>(createDto);
                    property.SellerId = User.IsInRole("Seller") ? userId : null;
                    property.AgentId = User.IsInRole("Agent") ? userId : null;
                    property.Type = Enum.Parse<PropertyType>(createDto.Type, true);
                    property.Status = Enum.Parse<PropertyStatus>(createDto.Status, true);
                    property.PropertyCategory = Enum.Parse<PropertyCategory>(createDto.PropertyCategory, true);
                    property.Images = new List<string>();
                    
                    if (User.IsInRole("Seller"))
                        property.ApprovalStatus = PropertyApprovalStatus.Pending;
                    else
                        property.ApprovalStatus = PropertyApprovalStatus.Approved;


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

                    //  If created by seller, create contract
                    if (User.IsInRole("Seller"))
                    {
                        var seller = await _sellerRepo.GetByIdAsync(userId);
                        if (seller == null || seller.IsDeleted)
                            return NotFound("Seller not found.");

                        if (createDto.ContractFile == null)
                            return BadRequest("Contract file is required when a seller creates a property.");
                        var contractUrl = _fileService.UploadFile("PropertyContracts", createDto.ContractFile);
                        if (string.IsNullOrEmpty(contractUrl))
                            return StatusCode(500, "Failed to upload contract file.");

                        var contract = new Contract
                        {
                            PropertyId = property.Id,
                            SellerId = userId,
                            ImageUrl = contractUrl
                        };
                        await _contractRepo.CreateAsync(contract);
                    }

                    var propertyDto = _mapper.Map<PropertyDto>(property);

                        transactionScope.Complete();
                    return CreatedAtAction(nameof(GetAll), new { id = property.Id }, propertyDto);
                }
                catch (Exception ex)
                {
                    transactionScope.Dispose();
                    return StatusCode(500, $"Error while creating property and contract: {ex.Message}");
                }
            }
        }

        // PUT: api/Property/5
        [HttpPut("Update/{id}")]
        [Authorize(Roles = "Seller,Agent")]
        public async Task<IActionResult> Update(int id, [FromForm] UpdatePropertyDto dto)
        {
            try
            {
                if (dto == null)
                return BadRequest("The dto field is required.");

                string userIdStr = User.FindFirst("userId")?.Value;

                if (!int.TryParse(userIdStr, out int userId))
                    return Unauthorized("User not found.");

                var property = await _propertyRepo.GetByIdAsync(id);

                if (property == null || property.IsDeleted)
                    return NotFound();

                if ((User.IsInRole("Seller") && property.SellerId != userId) ||
                    (User.IsInRole("Agent") && property.AgentId != userId))
                    return Unauthorized("You are not authorized for this property.");

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
                        _fileService.DeleteFile(oldImagePath);

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
            catch (Exception ex)
            {
                return StatusCode(500, "An error occurred while updating the property.");
            }
        }


        [HttpPatch("UpdateApprovalProperty/{id}")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> UpdateApprovalProperty(int id, [FromQuery] PropertyApprovalStatus Status)
        {
            var property = await _propertyRepo.GetByIdAsync(id);

            if (property == null)
                return NotFound($"Property with ID {id} not found.");

            var seller = await _sellerRepo.GetByIdAsync(property.SellerId.Value);
            if (seller == null)
            {
                return NotFound();
            }
            property.ApprovalStatus = Status;
            string statusText = Status.ToString();

            await _propertyRepo.UpdateAsync(property);

            if (property.ApprovalStatus == PropertyApprovalStatus.Approved)
            {
                bool availablePropertiesFlag = await _subscriptionRepo.DecreaseAvailablePropertiesByOne(seller.Id, UserType.Seller);
                if (!availablePropertiesFlag)
                {
                    return StatusCode(403, "Subscription limit reached. Please upgrade your plan.");
                }
            }


            string subject = "Property Approval Status Update";
            string body = $@"
                Dear {seller.FirstName} {seller.LastName},<br/><br/>
                Your property titled <strong>{property.Title}</strong> has been 
                <strong>{statusText}</strong>.<br/><br/>" +
          (Status == PropertyApprovalStatus.Approved
              ? "It is now live on the platform."
              : Status == PropertyApprovalStatus.Rejected
                  ? "Please review the guidelines or contact support."
                  : "It is currently under review.") + @"
                <br/><br/>
                Best regards,<br/>
                Real Estate Team";

            EmailDto emailDto = new EmailDto
            {
                To = seller.Account.Email,
                Subject = subject,
                Body = body
            };

            bool isEmailSent = _emailService.SendEmail(emailDto);
            if (!isEmailSent)
            {
                return StatusCode(500, "Property updated, but failed to send confirmation email.");
            }

            var propertyDto = _mapper.Map<PropertyDto>(property);
            return Ok(propertyDto);
        }


        // DELETE: api/Property/5
        [HttpDelete("Delete/{id}")]
        [Authorize(Roles = "Seller,Agent")]
        public async Task<IActionResult> Delete(int id)
        {
            try
            {
                string userIdStr = User.FindFirst("userId")?.Value;

                if (!int.TryParse(userIdStr, out int userId))
                    return Unauthorized("User not found.");

                var property = await _propertyRepo.GetByIdAsync(id);
                if (property == null || property.IsDeleted)
                    return NotFound("Property not found!");

                if ((User.IsInRole("Seller") && property.SellerId != userId) ||
                    (User.IsInRole("Agent") && property.AgentId != userId))
                    return Unauthorized("You are not authorized for this property.");

                // Check if an active auction is associated with this property
                var auction = await _auctionRepo.GetByProprtyIdAsync(id);
                if (auction != null && auction.Status == Status.Active && !auction.IsDeleted)
                    return BadRequest("Cannot delete the property because it has an active auction.");

                using (var transaction = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
                {
                    if (auction != null && auction.Status == Status.Scheduled && !auction.IsDeleted)
                        await _auctionRepo.DeleteAsync(auction.Id);

                    property.IsDeleted = true;
                    await _propertyRepo.UpdateAsync(property);

                    transaction.Complete();
                }
                return Ok(new { message = "Property soft-deleted successfully." });
            }
            catch(Exception ex)
            {
                return StatusCode(500, "An error occurred while deleting the property.");
            }
        }


    }
}
