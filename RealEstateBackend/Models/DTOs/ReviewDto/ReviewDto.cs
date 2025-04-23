using Stripe;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.ReviewDto
{
    public class ReviewDto
    {
        [Required]
        public int BuyerId { get; set; }

        [Required]
        public int ProductId { get; set; }

        [Range(1, 5)]
        public double Rating { get; set; }

        [MaxLength(300)]
        public string? Comment { get; set; }
    }
}
