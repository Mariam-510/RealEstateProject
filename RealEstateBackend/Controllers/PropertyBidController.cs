using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.PropertyBidDto;
using RealEstate.Repositories;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PropertyBidController : ControllerBase
    {
        private readonly IPropertyBidRepository _propertyBidRepo;
        private readonly IMapper _mapper;
        private readonly IAuctionRepository _auctionRepository;
        private readonly IBuyerRepository _buyerRepository;
        public PropertyBidController(IPropertyBidRepository propertyBidRepo, IAuctionRepository auctionRepository, IBuyerRepository buyerRepository, IMapper mapper)
        {
            _propertyBidRepo = propertyBidRepo;
            _mapper = mapper;
            _auctionRepository= auctionRepository;
            _buyerRepository= buyerRepository;
        }

        [HttpPost]
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> Create([FromBody] CreatePropertyBidDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            // Check if the auction exists
            var auction = await _auctionRepository.GetByIdAsync(createDto.AuctionId);
            if (auction == null)
            {
                return NotFound($"Auction with ID {createDto.AuctionId} not found.");
            }
            // Check if the auction is active
            if (auction.Status != Status.Active)
            {
                return BadRequest($"Bid cannot be placed as the auction is not active. Current status: {auction.Status}.");
            }
            // Check if the buyer exists
            var buyer = await _buyerRepository.GetByIdAsync(buyerId);
            if (buyer == null)
            {
                return NotFound($"Buyer with ID {buyerId} not found.");
            }

            var lastBid = await _propertyBidRepo.GetLastBidByAuctionIdAsync(createDto.AuctionId);
            var amount = auction.StartPrice;

            if (lastBid != null)
            {
                amount = lastBid.BidAmount;
            }

            if (createDto.BidAmount <= amount)
            {
                var errorMessage = lastBid != null
                    ? $"Bid amount must exceed the current highest bid of {amount}"
                    : $"Bid amount must be higher than the starting price of {amount}";

                return BadRequest(errorMessage);
            }

            var propertyBid = _mapper.Map<PropertyBid>(createDto);
            propertyBid.BuyerId = buyerId;

            var createdBid = await _propertyBidRepo.AddAsync(propertyBid);

            var bidDto = _mapper.Map<PropertyBidDto>(createdBid);

            bidDto.TimeAgo = GetTimeAgo(bidDto.Timestamp);
            
            return CreatedAtAction(nameof(GetById), new { id = bidDto.Id }, bidDto);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var bid = await _propertyBidRepo.GetByIdAsync(id);
            if (bid == null)
                return NotFound();
            var bidDto = _mapper.Map<PropertyBidDto>(bid);
            bidDto.TimeAgo = GetTimeAgo(bidDto.Timestamp);

            return Ok(bidDto);
        }

        [HttpGet("LastBid/{auctionId}")]
        public async Task<IActionResult> GetLastByAuctionId(int auctionId)
        {
            var bid = await _propertyBidRepo.GetLastBidByAuctionIdAsync(auctionId);
            if (bid == null)
                return NotFound();

            var bidDto = _mapper.Map<PropertyBidDto>(bid);
            
            bidDto.TimeAgo = GetTimeAgo(bidDto.Timestamp);

            return Ok(bidDto);
        }

        [HttpGet("auction/{auctionId}")]
        public async Task<IActionResult> GetByAuctionId(int auctionId)
        {
            var bids = await _propertyBidRepo.GetByAuctionIdAsync(auctionId);
            if (bids == null)
                return NotFound("No bids found for this auction.");

            // Map and set TimeAgo
            var bidDtos = _mapper.Map<List<PropertyBidDto>>(bids);
            foreach (var dto in bidDtos)
            {
                dto.TimeAgo = GetTimeAgo(dto.Timestamp);
            }

            return Ok(bidDtos);
        }

        private string GetTimeAgo(DateTime time)
        {
            var span = DateTime.Now - time;

            if (span.TotalDays >= 1)
                return $"{(int)span.TotalDays} day{(span.TotalDays >= 2 ? "s" : "")} ago";
            if (span.TotalHours >= 1)
                return $"{(int)span.TotalHours} h ago";
            if (span.TotalMinutes >= 1)
                return $"{(int)span.TotalMinutes} min ago";
            return "Just now";
        }


    }
}
