using RealEstate.Models.Attributes;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.Product
{
    public class ProductDTO
    {


        [Length(1, 50)]
        [Required]
        public string Name { get; set; }

        [Length(1, 200)]
        [Required]
        public string Description { get; set; }

        [NonNegative]
        [Required]
        public decimal Price { get; set; }

        [NonNegative]
        [Required]
        public int Quantity { get; set; }
        [Required]
        public bool IsUsed { get; set; }
        [Required]
        public int CategoryID { get; set; }
        [Required]
        public ICollection<IFormFile> Productimage { get; set; }

    }
}
