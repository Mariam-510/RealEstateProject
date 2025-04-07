using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Models.Domains
{
    public class Auction
    {
        [Key]
        public int Id { get; set; }

        [DataType(DataType.DateTime)]
        public DateTime StartTime { get; set; }  

        [DataType(DataType.DateTime)]
        public DateTime EndTime { get; set; }    

        [Column(TypeName = "decimal(18,2)")]
        public decimal StartPrice { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal BuyNowPrice { get; set; }

        public bool IsDeleted { get; set; } = false;

        public bool IsLive { get; set; }

        [ForeignKey("Property")]
        public int? PropertyId { get; set; }
        public virtual Property? Property { get; set; }

        public virtual ICollection<PropertyBid>? PropertyBids { get; set; }  
    }
}
