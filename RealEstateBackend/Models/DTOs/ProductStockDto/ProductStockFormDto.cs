using RealEstate.Models.Attributes;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Dtos.ProductStockDto
{
    public class ProductStockFormDto
    {
        [Required]
        public string Color { get; set; }

        [NonNegative]
        [Required]
        public int Quantity { get; set; }
    }
}
