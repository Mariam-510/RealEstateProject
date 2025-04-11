using RealEstate.Models.Attributes;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Domains
{
    public class Shipping
    {
        [Key]
        public int Id { get; set; }

        public string City { get; set; }

        [NonNegative]
        [Column(TypeName = "decimal(18,2)")]
        public decimal DeliveryFees { get; set; }

        public bool IsDeleted { get; set; } = false;
    }
}
