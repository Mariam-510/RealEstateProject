using System.ComponentModel.DataAnnotations;
using System.Security.Cryptography;
using System.Transactions;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.EntityFrameworkCore;
using RealEstate.Mapping;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.Auction;
using RealEstate.Models.DTOs.Category;
using RealEstate.Models.DTOs.PropertyBidDto;
using RealEstate.Models.DTOs.PropertyDto;
using RealEstate.Repositories;
using RealEstate.Services;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuctionController : ControllerBase
    {
        private readonly IMapper _mapper;
        private readonly IPropertyBidRepository propertyBidRepository;

        public IAuctionRepository _AuctionRepository { get; }
        public IPropertyRepository _propertyRepository { get; }
        public IAgentRepository _AgentRepository { get; }
        public ISellerRepository _SellerRepository { get; }
        public FileService _fileService { get; }

        public AuctionController(IAuctionRepository auctionRepository, IPropertyRepository propertyRepository,
            IAgentRepository agentRepository , ISellerRepository sellerRepository, IMapper mapper,
            IPropertyBidRepository propertyBidRepository)
        {
            _AuctionRepository = auctionRepository;
            _propertyRepository = propertyRepository;
            _AgentRepository = agentRepository;
            _SellerRepository = sellerRepository;
            _mapper = mapper;
            this.propertyBidRepository = propertyBidRepository;
        }
        

        [HttpPost("Add")]
        [Authorize(Roles = "Seller,Agent")]
        public async Task<IActionResult> CreateAuction([FromForm] AuctionDTO AuctionDtO)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string userIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized("User not found.");


            if (AuctionDtO.StartTime >= AuctionDtO.EndTime)
                return BadRequest("Start time must be earlier than End time.");

            var property = await _propertyRepository.GetByIdAsync(AuctionDtO.PropertyId);

            if (property == null)
                return NotFound("Property not found!");

            if ((User.IsInRole("Seller") && property.SellerId != userId) ||
                (User.IsInRole("Agent") && property.AgentId != userId))
                return Unauthorized("You are not authorized for this property.");


            using (var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    if (property.Status == PropertyStatus.Auctioned)
                        return BadRequest("Property is already auctioned.");

                    if (property.Status == PropertyStatus.Sold)
                        return BadRequest("Property is already sold.");

                    property.Status = PropertyStatus.Auctioned;

                    await _propertyRepository.UpdateAsync(property);

                    var AuctionModel = AuctionDtO.ToAuctionModel();

                    if (User.IsInRole("Seller"))
                        AuctionModel.SellerId = userId;

                    else if (User.IsInRole("Agent"))
                        AuctionModel.AgentId = userId;

                    var ActionCreated = await _AuctionRepository.CreateAsync(AuctionModel);

                    var ActionShow = ActionCreated.ToAuctionDTOShow();

                    transactionScope.Complete();

                    return Ok(new { message = "Auction Created Successfully!", ActionShow });
                }
                catch (Exception ex)
                {
                    transactionScope.Dispose();
                    return StatusCode(500, new { message = "An unexpected error occurred." });
                }
            }
            
        }


        [HttpDelete("DeleteAuction/{id}")]
        [Authorize(Roles = "Seller,Agent")]
        public async Task<IActionResult> DeleteAuction(int id)
        {
            string userIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized("User not found.");

            var GetAuction = await _AuctionRepository.GetByIdAsync(id);
            if (GetAuction == null)
                return NotFound("Auction not found!");

            var property = await _propertyRepository.GetByIdAsync(GetAuction.PropertyId.Value);
            if (property == null)
                return NotFound("Property not found!");

            if ((User.IsInRole("Seller") && property.SellerId != userId) ||
                (User.IsInRole("Agent") && property.AgentId != userId))
                return Unauthorized("You are not authorized for this property.");

            if (GetAuction.Status == Status.Active)
                return BadRequest("Can't delete an active auction!");

            if (GetAuction.Status == Status.Finished)
                return BadRequest("Auction already ended!");

            using (var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    var AuctionDeleted = await _AuctionRepository.DeleteAsync(id);
                    property.Status = PropertyStatus.Available;
                    await _propertyRepository.UpdateAsync(property);

                    AuctionDTOShow ActionShow = AuctionDeleted.ToAuctionDTOShow();

                    transactionScope.Complete();
<<<<<<< Updated upstream
                    return Ok(new { message = "Auction deleted successfully.", ActionShow });
=======

                    // Real-time notifications
                    await _hubContext.Clients.All.SendAsync("AuctionDeleted", id);
                    //await _hubContext.Clients.Group($"Auction-{id}")
                    //    .SendAsync("AuctionRemoved", id);

                    return Ok(ActionShow );
>>>>>>> Stashed changes
                }
                catch (Exception ex)
                {
                    transactionScope.Dispose();
                    return StatusCode(500, new { message = "An unexpected error occurred." });
                }
            }
          
        }


        [HttpGet("GetAuctionByID/{id}")]
        public async Task<IActionResult> GetAuctionByid(int id)
        {

            var ActionData = await _AuctionRepository.GetByIdAsync(id);
            if (ActionData == null)
            {
                return NotFound("Auction ID Not found!");
            }

            AuctionDTOShow ActionShow = ActionData.ToAuctionDTOShow();

            var property = await _propertyRepository.GetByIdAsync(ActionShow.PropertyId);
            ActionShow.PropertyDto = _mapper.Map<PropertyDto>(property);

            var lastPropertyBid = await propertyBidRepository.GetLastBidByAuctionIdAsync(ActionShow.Id);
            ActionShow.LastPropertyBidDto = _mapper.Map<PropertyBidDto>(lastPropertyBid);

            var propertyBids = await propertyBidRepository.GetByAuctionIdAsync(ActionShow.Id);
            ActionShow.NumOfPropertyBids = propertyBids.Count();

            return Ok(ActionShow);

        }


        [HttpGet("Property/{propertyId}")]
        public async Task<IActionResult> GetAuctionByPropertyId(int propertyId)
        {

            var ActionData = await _AuctionRepository.GetByProprtyIdAsync(propertyId);
            if (ActionData == null)
            {
                return NotFound("Auction ID Not found!");
            }
            AuctionDTOShow ActionShow = ActionData.ToAuctionDTOShow();

            return Ok(new { message = "Auction is", ActionShow });

        }


        [HttpGet("GetAuctionByUserID")]
        [Authorize(Roles = "Seller,Agent")]
        public async Task<IActionResult> GetAuctionByUserID()
        {
            string userIdStr = User.FindFirst("userId")?.Value;
                if (!int.TryParse(userIdStr, out int userId))
                    return Unauthorized("User not found.");
            List<Auction> ActionData = null;

            if (User.IsInRole("Seller"))
            {
                var seller = await _SellerRepository.GetByIdAsync(userId);
                
                if (seller == null)
                    return NotFound("seller not found.");
                ActionData = await _AuctionRepository.GetByUserID(null, userId);


            }
            else if (User.IsInRole("Agent"))
            {
                var agent = await _AgentRepository.GetByIdAsync(userId);
                if (agent == null)
                    return NotFound("Agent not found.");
                ActionData = await _AuctionRepository.GetByUserID(userId, null);

            }
            else
            {
                return Unauthorized("Invalid role.");
            }

         

            List<AuctionDTOShow> ActionShowList = ActionData.Select(a => a.ToAuctionDTOShow()).ToList();
            foreach (var a in ActionShowList)
            {
                a.PropertyDto = _mapper.Map<PropertyDto>(await _propertyRepository.GetByIdAsync(a.PropertyId));
                var bidsModel = await propertyBidRepository.GetByAuctionIdAsync(a.Id);
                a.bids = _mapper.Map<List<PropertyBidDto>>(bidsModel);
                a.NumOfPropertyBids = a.bids.Count;
                a.LastPropertyBidDto = a.bids.FirstOrDefault();  // No need for null check here
            }

            return Ok(
            
              ActionShowList
           );
        }


        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll(string? sortByPrice = null, string? sortByTime = null, Status? ISLivestatus = null)
        {
        
<<<<<<< Updated upstream
            var AuctionsModel = await _AuctionRepository.GetAllAsync(sortByPrice, sortByTime, ISLivestatus);
            if (AuctionsModel == null)
            {

                return NotFound("Empty Auction List!");

            }
            var AuctionDto = AuctionsModel.ToAuctionDTOShowList();

            foreach (var auction in AuctionDto)
            {
                var property = await _propertyRepository.GetByIdAsync(auction.PropertyId);
                auction.PropertyDto = _mapper.Map<PropertyDto>(property);
               
                var lastPropertyBid = await propertyBidRepository.GetLastBidByAuctionIdAsync(auction.Id);
                auction.LastPropertyBidDto = _mapper.Map<PropertyBidDto>(lastPropertyBid);

                var propertyBids = await propertyBidRepository.GetByAuctionIdAsync(auction.Id);
                auction.NumOfPropertyBids = propertyBids.Count();
            }

            if (AuctionDto == null)
            {

                return BadRequest("Error! While Fetching Auction List!");

            }
            return Ok(AuctionDto);
        }


        [HttpGet("GetByBuyerID/{id}")]
        public async Task<IActionResult> GetByBuyerID(int id )
=======
        [HttpGet("GetByBuyerID")]
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> GetByBuyerID( )
>>>>>>> Stashed changes
        {
            string userIdStr = User.FindFirst("userId")?.Value;
            if (!int.TryParse(userIdStr, out int buyerId))
                return Unauthorized("Buyer not found.");

            List<Auction>  AuctionModel = await _AuctionRepository.GetByBuyerID(buyerId);
            var AuctionDto = AuctionModel.ToAuctionDTOShowList();
            if (AuctionDto == null)
            {

                return BadRequest("Error! While Fetching Product List!");

            }
            foreach (var a in AuctionDto)
            {
                a.PropertyDto = _mapper.Map<PropertyDto>(await _propertyRepository.GetByIdAsync(a.PropertyId));
                var bidsModel = await propertyBidRepository.GetByAuctionIdAsync(a.Id);
                a.bids = _mapper.Map<List<PropertyBidDto>>(bidsModel);
                a.NumOfPropertyBids = a.bids.Count;
                a.LastPropertyBidDto = a.bids.FirstOrDefault();  // No need for null check here
            }
            return Ok( AuctionDto );
        }


        [HttpPut("UpdateAuction/{id}")]
        public async Task<IActionResult> UpdateAuction(int id, [FromForm] DateTime StartTime, [FromForm] DateTime EndTime, [FromForm] decimal StartPrice, [FromForm] Status isLive)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
            if (StartTime >= EndTime)
            {
                return BadRequest("Start time must be earlier than end time.");
            }

            Auction GetAction = await _AuctionRepository.GetByIdAsync(id);
            if (GetAction == null)
            {
                return NotFound("Auction Not found !");
            }
            if (GetAction.Status == Status.Scheduled)
            {
                Auction UpdateAuction = await _AuctionRepository.UpdateAsync(id, StartTime, EndTime, StartPrice, isLive);
                AuctionDTOShow ActionShow = UpdateAuction.ToAuctionDTOShow();
                return Ok(new { message = "Auction Updated Successfully!", ActionShow });
            }
            return BadRequest("Cant Update auction Now !");

        }


        [HttpGet("GetHighestBid")]
        [Authorize(Roles = "Seller,Agent")]
        public async Task<IActionResult> GetHighestBidForEndedAuctionsByUserId()
        {
            try
            {
                string userIdStr = User.FindFirst("userId")?.Value;

                if (!int.TryParse(userIdStr, out int userId))
                    return Unauthorized("User not found.");

                if (User.IsInRole("Seller"))
                {
                    var seller = await _SellerRepository.GetByIdAsync(userId);

                    if (seller == null || seller.IsDeleted)
                        return NotFound($"Seller with ID {userId} does not exist or is deleted!");

                    var highestBid = await _AuctionRepository.GetHighestBidForEndedAuctionsBySellerAsync(userId);

                    if (!highestBid.HasValue)
                        return NotFound("No bids found for this seller's ended auctions");

                    return Ok(new { HighestBid = highestBid });

                }
                else
                {
                    var agent = await _AgentRepository.GetByIdAsync(userId);
                    if (agent == null || agent.IsDeleted)
                        return NotFound($"Agent with ID {userId} does not exist or is deleted!");

                    var highestBid = await _AuctionRepository.GetHighestBidForEndedAuctionsByAgentAsync(userId);

                    if (!highestBid.HasValue)
                        return NotFound("No bids found for this seller's ended auctions");

                    return Ok(new { HighestBid = highestBid });
                }
                
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { message = "An unexpected error occurred." });
            }
        }
    }
}
