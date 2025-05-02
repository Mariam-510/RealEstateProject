using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.AuctionBuyerDto;
using RealEstate.Models.Dtos.ShippingDto;
using RealEstate.Repositories;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuctionBuyersController : ControllerBase
    {
        public IAuctionBuyerRepository AuctionBuyerRepository { get; }
        public IPaymentRepository PaymentRepository { get; }
        public IBuyerRepository BuyerRepository { get; }
        public IAuctionRepository AuctionRepository { get; }
        public IMapper Mapper { get; }

        public AuctionBuyersController(IAuctionBuyerRepository auctionBuyerRepository, IPaymentRepository paymentRepository,
            IBuyerRepository buyerRepository, IAuctionRepository auctionRepository,IMapper mapper)
        {
            AuctionBuyerRepository = auctionBuyerRepository;
            PaymentRepository = paymentRepository;
            BuyerRepository = buyerRepository;
            AuctionRepository = auctionRepository;
            Mapper = mapper;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var auctionBuyers = await AuctionBuyerRepository.GetAllAsync();

            var auctionBuyerDtosDto = Mapper.Map<List<AuctionBuyerDto>>(auctionBuyers);

            return Ok(auctionBuyerDtosDto);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var auctionBuyer = await AuctionBuyerRepository.GetByIdAsync(id);

            if (auctionBuyer == null)
            {
                return NotFound();
            }

            var auctionBuyerDto = Mapper.Map<AuctionBuyerDto>(auctionBuyer);

            return Ok(auctionBuyerDto);
        }


        [HttpGet("AuctionBuyer/{auctionId}")]
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> GetByAuctionAndBuyerId([FromRoute] int auctionId)
        {
            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            var buyer = await BuyerRepository.GetByIdAsync(buyerId);

            if (buyer == null)
            {
                return NotFound("Buyer not found");
            }

            var auction = await AuctionRepository.GetByIdAsync(auctionId);

            if (auction == null)
            {
                return NotFound("Auction not found");
            }

            var auctionBuyer = await AuctionBuyerRepository.GetByAuctionAndBuyerIdAsync(buyerId,auctionId);

            if (auctionBuyer == null)
            {
                return Ok(null);
            }

            var auctionBuyerDto = Mapper.Map<AuctionBuyerDto>(auctionBuyer);

            return Ok(auctionBuyerDto);
        }


        [HttpPost]
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> Create([FromBody] CreateAuctionBuyerDto createAuctionBuyerDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            var buyer = await BuyerRepository.GetByIdAsync(buyerId);

            if (buyer == null)
            {
                return NotFound("Buyer not found");
            }

            var auction = await AuctionRepository.GetByIdAsync(createAuctionBuyerDto.AuctionId);

            if (auction == null)
            {
                return NotFound("Auction not found");
            }

            //Status Update Start
            auction = await AuctionRepository.CheckAndUpdateStatus(auction.Id);
            if (auction == null)
            {
                return NotFound("Auction not found");
            }

            var auctions = await AuctionRepository.CheckAndUpdateAllAuctionsStatus();

            if (auction.Status == Status.Finished)
            {
                return BadRequest("Auction Ended");
            }

            var existingAuctionBuyer = await AuctionBuyerRepository.GetByAuctionAndBuyerIdAsync(buyerId, auction.Id);
            if (existingAuctionBuyer != null)
            {
                return BadRequest("Already paid");
            }

            var payment = await PaymentRepository.GetByIdAsync(createAuctionBuyerDto.PaymentId);

            if (payment == null)
            {
                return NotFound("Auction not found");
            }
            decimal minimumPayment = Math.Round(auction.StartPrice * 0.10m, 2);

            if (payment.Amount < minimumPayment)
            {
                return BadRequest($"You should pay at least {minimumPayment}.");
            }

            var auctionBuyer = Mapper.Map<AuctionBuyer>(createAuctionBuyerDto);
            auctionBuyer.BuyerId = buyerId;

            auctionBuyer = await AuctionBuyerRepository.CreateAsync(auctionBuyer);

            if (auctionBuyer == null)
                return StatusCode(500, new { message = "An error occurred while creating" });

            var auctionBuyerDto = Mapper.Map<AuctionBuyerDto>(auctionBuyer);

            return Ok(new { message = "Created Successfully!", auctionBuyerDto });
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            var auctionBuyer = await AuctionBuyerRepository.DeleteAsync(id);

            if (auctionBuyer == null)
            {
                return NotFound();
            }

            var auctionBuyerDto = Mapper.Map<AuctionBuyerDto>(auctionBuyer);

            return Ok(auctionBuyerDto);
        }

    }
}
