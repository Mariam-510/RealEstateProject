using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.ReviewDto
{
    public class ReviewResponseDto
    {
        public int Rating { get; set; }

        public string? Comment { get; set; }

        public int? BuyerId { get; set; }

        public int? ProductId { get; set; }
    }
}
