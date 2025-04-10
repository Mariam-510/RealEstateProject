using AutoMapper;
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
        public PropertyBidController(IPropertyBidRepository propertyBidRepo, IMapper mapper)
        {
            _propertyBidRepo = propertyBidRepo;
            _mapper = mapper;
        }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreatePropertyBidDto createDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var propertyBid = _mapper.Map<PropertyBid>(createDto);

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

        [HttpGet("auction/{auctionId}")]
        public async Task<IActionResult> GetByAuctionId(int auctionId)
        {
            var bids = await _propertyBidRepo.GetByAuctionIdAsync(auctionId);
            if (bids == null || !bids.Any())
                return NotFound("No bids found for this auction.");

            // Sort by Timestamp DESC, then by BidAmount DESC
            var sortedBids = bids
                .OrderByDescending(b => b.Timestamp)
                .ThenByDescending(b => b.BidAmount)
                .ToList();

            // Map and set TimeAgo
            var bidDtos = _mapper.Map<List<PropertyBidDto>>(sortedBids);
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
