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
        public async Task<ActionResult> GetAll(int buyerId)
        {
            var existingBuyer = await _buyerRepository.GetByIdAsync(buyerId);
            if (existingBuyer == null)
                return NotFound("Buyer not found!");

            var reviews = await _reviewRepository.GetAllByBuyerAsync(buyerId);

            var response = reviews.Select(r => r.ReviewResponseDto()).ToList();

            return Ok(response);
        }

        [HttpPost]
        [Route("Create")]
        public async Task<ActionResult> Create(ReviewDto reviewDto)
        {
            if (reviewDto == null)
                return BadRequest("Invalid review data!");

            var product = await _productRepository.GetByIdAsync(reviewDto.ProductId);
            if (product == null)
                return NotFound("Product not found!");

            var buyer = await _buyerRepository.GetByIdAsync(reviewDto.BuyerId);
            if (buyer == null)
                return NotFound("Buyer not found!");

            var review = new Review
            {
                Rating = reviewDto.Rating,
                Comment = reviewDto.Comment,
                ProductId = reviewDto.ProductId,
                BuyerId = reviewDto.BuyerId,
            };

            var createdReview = await _reviewRepository.CreateAsync(review);

            var response = createdReview.ReviewResponseDto();
            return Ok(response);
        }

        [HttpPost]
        [Route("Edit")]
        public async Task<ActionResult> Edit(int id, ReviewDto reviewDto)
        {
            if (reviewDto == null)
                return BadRequest("Invalid review data!");

            var product = await _productRepository.GetByIdAsync(reviewDto.ProductId);
            if (product == null)
                return NotFound("Product not found!");

            var buyer = await _buyerRepository.GetByIdAsync(reviewDto.BuyerId);
            if (buyer == null)
                return NotFound("Buyer not found!");

            var existingReview = await _reviewRepository.GetByIdAsync(id);
            if (existingReview == null)
                return NotFound("Review not found!");

            existingReview.Rating = reviewDto.Rating;
            existingReview.Comment = reviewDto.Comment;
            existingReview.ProductId = reviewDto.ProductId;
            existingReview.BuyerId = reviewDto.BuyerId;

            var updatedReview = await _reviewRepository.UpdateAsync(existingReview);

            var response = updatedReview.ReviewResponseDto();

            return Ok(response);
        }

        [HttpDelete]
        [Route("Delete/{id}")]
        public async Task<ActionResult> Delete(int id)
        {
            var existingReview = await _reviewRepository.GetByIdAsync(id);
            if (existingReview == null)
                return NotFound("Review not found!");

            var deletedReview = await _reviewRepository.DeleteAsync(id);
            return Ok("Review deleted successfully.");
        }

    }
}
