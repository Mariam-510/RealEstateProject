using RealEstate.Models.Attributes;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Dtos.ProductStockDto
{
    public class ProductStockDto
    {
        public int Id { get; set; }

        public string Color { get; set; }

        public int Quantity { get; set; }

        public bool IsDeleted { get; set; }

        public int? ProductId { get; set; }
    }
}
