using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.ReviewDto
{
    public class ReviewResponseDto
    {
        public int Id { get; set; }

        public double Rating { get; set; }

        public string? Comment { get; set; }

        public string Date { get; set; }

        public int? BuyerId { get; set; }
        
        public string? BuyerFName { get; set; }
       
        public string? BuyerLName { get; set; }

        public string? BuyerImageUrl { get; set; }

        public int? ProductId { get; set; }

        public string? ProductName { get; set; }

        public string? ProductImage { get; set; }

        public string? CategoryName { get; set; }

    }
}
