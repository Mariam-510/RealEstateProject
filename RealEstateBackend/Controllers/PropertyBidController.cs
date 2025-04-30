using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using RealEstate.Hubs;
using RealEstate.Mapping;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.PropertyBidDto;
using RealEstate.Models.DTOs.PropertyDto;
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
        private readonly IHubContext<AuctionHub> _hubContext;
        private readonly IPropertyRepository _propertyRepository;

        public PropertyBidController(IPropertyBidRepository propertyBidRepo, IAuctionRepository auctionRepository, IBuyerRepository buyerRepository,
            IMapper mapper, IHubContext<AuctionHub> hubContext, IPropertyRepository propertyRepository)
        {
            _propertyBidRepo = propertyBidRepo;
            _mapper = mapper;
            _auctionRepository= auctionRepository;
            _buyerRepository= buyerRepository;
            _hubContext = hubContext;
            _propertyRepository = propertyRepository;
        }

        //signal r
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

            // Update auction status first
            auction = await _auctionRepository.CheckAndUpdateStatus(createDto.AuctionId);

            // Get updated bid information
            var allBids = await _propertyBidRepo.GetByAuctionIdAsync(createDto.AuctionId);
            var bidDtos = allBids.Select(b =>
            {
                var dto = _mapper.Map<PropertyBidDto>(b);
                dto.TimeAgo = GetTimeAgo(b.Timestamp);
                return dto;
            }).ToList();

            // Get associated property and auction
            auction = await _auctionRepository.GetByIdAsync(createDto.AuctionId);
            var property = await _propertyRepository.GetByIdAsync(auction.PropertyId.Value);

            var realtimeData = new
            {
                AuctionId = createDto.AuctionId,
                AllBids = bidDtos,
                BidCount = bidDtos.Count,
                LastBid = bidDtos.FirstOrDefault(),
                PropertyStatus = property.Status.ToString(),
                AuctionStatus = auction.Status.ToString()
            };

            // Send real-time updates
            await _hubContext.Clients.Group($"Auction-{createDto.AuctionId}")
                .SendAsync("AllBidsUpdated", realtimeData);

            var auctionDto = auction.ToAuctionDTOShow();

            // Sequential data loading
            auctionDto.PropertyDto = _mapper.Map<PropertyDto>(property);
            auctionDto.bids = bidDtos;
            auctionDto.NumOfPropertyBids = auctionDto.bids.Count;
            auctionDto.LastPropertyBidDto = auctionDto.bids.FirstOrDefault();

            await _hubContext.Clients.All.SendAsync("AuctionListUpdate", auctionDto);


            return CreatedAtAction(nameof(GetById), new { id = createdBid.Id },
            _mapper.Map<PropertyBidDto>(createdBid));

        }

        //signal r
        [HttpGet("auction/{auctionId}")]
        public async Task<IActionResult> GetByAuctionId(int auctionId)
        {
            var bids = await _propertyBidRepo.GetByAuctionIdAsync(auctionId);
            if (bids == null) return NotFound("No bids found for this auction.");

            var bidDtos = bids.Select(b =>
            {
                var dto = _mapper.Map<PropertyBidDto>(b);
                dto.TimeAgo = GetTimeAgo(b.Timestamp);
                return dto;
            }).ToList();

            // Broadcast to all connected clients
            await _hubContext.Clients.All.SendAsync("BidHistoryUpdated", new
            {
                AuctionId = auctionId,
                Bids = bidDtos
            });

            return Ok(bidDtos);
        }
       
        //-------------------------------------------------------------------------------------------------------
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
                return Ok();

            var bidDto = _mapper.Map<PropertyBidDto>(bid);
            
            bidDto.TimeAgo = GetTimeAgo(bidDto.Timestamp);

            return Ok(bidDto);
        }

        private string GetTimeAgo(DateTime time)
        {
            var span = DateTime.Now.AddHours(1) - time;

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
