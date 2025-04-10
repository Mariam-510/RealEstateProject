using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.Category
{
    public class CategoryDTO
    {
      

        [Length(1, 50)]
        [Required]
        public string Name { get; set; }
        [Required]
        public IFormFile Categoryimage { get; set; }

    }
}
