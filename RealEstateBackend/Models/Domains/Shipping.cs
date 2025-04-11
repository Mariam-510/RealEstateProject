using RealEstate.Models.Attributes;
<<<<<<< HEAD
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
=======
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
>>>>>>> 79f45706c735042f1fab996ea1658e930a8e0871

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
