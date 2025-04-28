using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Mapping;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.ReviewDto;
using RealEstate.Repositories;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ReviewsController : ControllerBase
    {
        public IReviewRepository _reviewRepository { get; }
        public IProductRepository _productRepository { get; }
        public IBuyerRepository _buyerRepository { get; }

        public ReviewsController(IReviewRepository reviewRepository, IProductRepository productRepository, IBuyerRepository buyerRepository)
        {
            _reviewRepository = reviewRepository;
            _productRepository = productRepository;
            _buyerRepository = buyerRepository;
        }

        [HttpGet]
        [Route("GetAll")]
        [Authorize(Roles = "Buyer")]
        public async Task<ActionResult> GetAll()
        {
            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            var existingBuyer = await _buyerRepository.GetByIdAsync(buyerId);
            if (existingBuyer == null)
                return NotFound("Buyer not found!");

            var reviews = await _reviewRepository.GetAllByBuyerAsync(buyerId);

            var response = reviews.Select(r => r.ReviewResponseDto()).ToList();

            return Ok(response);
        }

        [HttpGet]
        [Route("ByProduct/{productId}")]
        public async Task<ActionResult> GetAllByProduct(int productId)
        {
            var existingProduct = await _productRepository.GetByIdAsync(productId);
            if (existingProduct == null)
                return NotFound("Buyer not found!");

            var reviews = await _reviewRepository.GetAllByProductAsync(productId);

            var response = reviews.Select(r => r.ReviewResponseDto()).ToList();

            return Ok(response);
        }

        [HttpPost]
        [Route("Create")]
        [Authorize(Roles = "Buyer")]
        public async Task<ActionResult> Create(ReviewDto reviewDto)
        {
            if(!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            if (reviewDto == null)
                return BadRequest("Invalid review data!");

            var product = await _productRepository.GetByIdAsync(reviewDto.ProductId);
            if (product == null)
                return NotFound("Product not found!");

            var buyer = await _buyerRepository.GetByIdAsync(buyerId);
            if (buyer == null)
                return NotFound("Buyer not found!");

            var review = new Review
            {
                Rating = reviewDto.Rating,
                Comment = reviewDto.Comment,
                ProductId = reviewDto.ProductId,
                BuyerId = buyerId,
            };

            var createdReview = await _reviewRepository.CreateAsync(review);

            var response = createdReview.ReviewResponseDto();
            return Ok(response);
        }

        [HttpPost]
        [Route("Edit")]
        [Authorize(Roles = "Buyer")]
        public async Task<ActionResult> Edit(int id, ReviewDto reviewDto)
        {
            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            if (reviewDto == null)
                return BadRequest("Invalid review data!");

            var product = await _productRepository.GetByIdAsync(reviewDto.ProductId);
            if (product == null)
                return NotFound("Product not found!");

            var buyer = await _buyerRepository.GetByIdAsync(buyerId);
            if (buyer == null)
                return NotFound("Buyer not found!");

            var existingReview = await _reviewRepository.GetByIdAsync(id);
            if (existingReview == null)
                return NotFound("Review not found!");

            existingReview.Rating = reviewDto.Rating;
            existingReview.Comment = reviewDto.Comment;
            existingReview.ProductId = reviewDto.ProductId;
            existingReview.BuyerId = buyerId;

            var updatedReview = await _reviewRepository.UpdateAsync(existingReview);

            var response = updatedReview.ReviewResponseDto();

            return Ok(response);
        }

        [HttpDelete]
        [Route("Delete/{id}")]
        [Authorize(Roles = "Buyer")]
        public async Task<ActionResult> Delete(int id)
        {
            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            var existingReview = await _reviewRepository.GetByIdAsync(id);
            if (existingReview == null)
                return NotFound("Review not found!");

            if(existingReview.BuyerId != buyerId)
            {
                return Unauthorized();
            }

            var deletedReview = await _reviewRepository.DeleteAsync(id);
            return Ok("Review deleted successfully.");
        }

    }
}
