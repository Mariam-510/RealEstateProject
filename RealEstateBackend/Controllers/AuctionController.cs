using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
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
        

        [HttpPost("CreateAuction")]
        public async Task<IActionResult> CreateAuction([FromForm] AuctionDTO AuctionDtO)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }
          
            DateTime now = DateTime.Now;


            if (AuctionDtO.StartTime >= AuctionDtO.EndTime)
            {
                return BadRequest("Start time must be earlier than End time.");
            }
            var property = await _propertyRepository.GetByIdAsync(AuctionDtO.PropertyId);
            if (property == null) 
            {
                return NotFound("Property ID Not Found");
            }
            if (AuctionDtO.AgentId != null)
            {
                var Agent = await _AgentRepository.GetByIdAsync(AuctionDtO.AgentId.Value);
                if (Agent == null)
                {
                    return NotFound("Agent ID Not Found");
                }
                if(property.AgentId!= Agent.Id)
                {
                    return Unauthorized("You Not allowed To Add Auction ");
                }
            }
            if (AuctionDtO.SellerId != null)
            {
                var seller = await _SellerRepository.GetByIdAsync(AuctionDtO.SellerId.Value);

                if (seller == null)
                {
                    return NotFound("Seller ID not Found");
                }
                if (property.SellerId != seller.Id)
                {
                    return Unauthorized("You Not allowed To Add Auction ");
                }
            }


            var AuctionModel = AuctionDtO.ToAuctionModel();

            property.Status = PropertyStatus.Auctioned;
             await _propertyRepository.UpdateAsync(property);

            var ActionCreated = await _AuctionRepository.CreateAsync(AuctionModel);
            
            var ActionShow= ActionCreated.ToAuctionDTOShow();

            return Ok(new { message = "Auction Created Successfully!", ActionShow });
        }


        [HttpDelete("DeleteAuction/{id}")]
        public async Task<IActionResult> DeleteAuction(int id)
        {
            var GetAction = await _AuctionRepository.GetByIdAsync(id);
            if(GetAction==null)
            {
                return NotFound("Auction ID Not found !");
            }
            if(GetAction.Status==Status.Scheduled)
            {
                var ActionDeleted = await _AuctionRepository.DeleteAsync(id);

                var property = await _propertyRepository.GetByIdAsync((int) GetAction.PropertyId);
                if (property == null)
                {
                    return NotFound("Property ID Not Found");
                }

                property.Status = PropertyStatus.Available;
                await _propertyRepository.UpdateAsync(property);

                AuctionDTOShow ActionShow = ActionDeleted.ToAuctionDTOShow();
                return Ok(new { message = "Auction is", ActionShow });
            }
            return BadRequest("Cant Delete This Auction");
          

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
