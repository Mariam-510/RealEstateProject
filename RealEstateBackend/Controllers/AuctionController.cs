using System.ComponentModel.DataAnnotations;
using System.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.ApplicationModels;
using Microsoft.EntityFrameworkCore;
using RealEstate.Mapping;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.Auction;
using RealEstate.Models.DTOs.Category;
using RealEstate.Repositories;
using RealEstate.Services;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuctionController : ControllerBase
    {
        public IAuctionRepository _AuctionRepository { get; }
        public IPropertyRepository _propertyRepository { get; }
        public IAgentRepository _AgentRepository { get; }
        public ISellerRepository _SellerRepository { get; }
        public FileService _fileService { get; }

        public AuctionController(IAuctionRepository auctionRepository, IPropertyRepository propertyRepository,
            IAgentRepository agentRepository , ISellerRepository sellerRepository)
        {
            _AuctionRepository = auctionRepository;
            _propertyRepository = propertyRepository;
            _AgentRepository = agentRepository;
            _SellerRepository = sellerRepository;
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
                    return Ok(new { message = "Auction deleted successfully.", ActionShow });
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

            Auction ActionData = await _AuctionRepository.GetByIdAsync(id);
            if (ActionData == null)
            {
                return NotFound("Auction ID Not found!");
            }
            AuctionDTOShow ActionShow = ActionData.ToAuctionDTOShow();

            return Ok(new { message = "Auction is", ActionShow });

        }


        [HttpGet("GetAuctionByUserID")]
        public async Task<IActionResult> GetAuctionByUserID(int? AgentID = null, int? SellerID = null)
        {
            if (AgentID.HasValue && SellerID.HasValue)
            {
                return BadRequest("Please provide at least one field.");
            }
            if (!AgentID.HasValue && !SellerID.HasValue)
            {
                return BadRequest("Please provide at least one field.");
            }
            if (AgentID != null)
            {
                var Agent = await _AgentRepository.GetByIdAsync(AgentID.Value);
                if (Agent == null)
                {
                    return NotFound("Agent ID Not Found");
                }
            }
            if (SellerID != null)
            {
                var seller = await _SellerRepository.GetByIdAsync(SellerID.Value);

                if (seller == null)
                {
                    return NotFound("Seller ID not Found");
                }
            }

            List<Auction> ActionData = await _AuctionRepository.GetByUserID(AgentID, SellerID);

            if (ActionData == null || !ActionData.Any())
            {
                return NotFound("No auctions found for the given input.");
            }

            List<AuctionDTOShow> ActionShowList = ActionData.Select(a => a.ToAuctionDTOShow()).ToList();

            return Ok(new
            {
                message = "Auctions are",
                auctions = ActionShowList
            });
        }


        [HttpGet("GetAll")]
        public async Task<IActionResult> GetAll(string? sortByPrice = null, string? sortByTime = null, Status? ISLivestatus = null)
        {
        
            var AuctionModel = await _AuctionRepository.GetAllAsync(sortByPrice, sortByTime, ISLivestatus);
            if (AuctionModel == null)
            {

                return NotFound("Empty Auction List!");

            }
            var AuctionDto = AuctionModel.ToAuctionDTOShowList();
            if (AuctionDto == null)
            {

                return BadRequest("Error! While Fetching Product List!");

            }
            return Ok(new { message = "Auction List is :", AuctionDto });
        }


        [HttpGet("GetByBuyerID/{id}")]
        public async Task<IActionResult> GetByBuyerID(int id )
        {

            List<Auction>  AuctionModel = await _AuctionRepository.GetByBuyerID(id);
            if (AuctionModel == null||!AuctionModel.Any())
            {

                return NotFound("BuyerID dont have Auction!");

            }
            var AuctionDto = AuctionModel.ToAuctionDTOShowList();
            if (AuctionDto == null)
            {

                return BadRequest("Error! While Fetching Product List!");

            }
            return Ok(new { message = "Action List is :", AuctionDto });
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

        }
    }
