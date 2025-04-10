using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.PropertyDto
{
    public class UpdatePropertyDto 
    {
        [Required]
        public string Title { get; set; }

        [Required]
        public string Description { get; set; }

        [Required]
        public string Location { get; set; }

        [Required]
        public decimal Price { get; set; }

        [Required]
        public string Type { get; set; }

        [Required]
        public string PropertyCategory { get; set; }

        [Required]
        public string Status { get; set; } // Available, Sold, Auctioned


        // Optional new images
        [Required]
        public ICollection<IFormFile> Images { get; set; }



    }
}
