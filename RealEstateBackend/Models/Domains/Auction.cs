using RealEstate.Models.Attributes;
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
        [NonNegative]
        public decimal StartPrice { get; set; }
        public bool IsDeleted { get; set; } = false;

        public Status Status { get; set; }

        [ForeignKey("Agent")]
        public int? AgentId { get; set; }
        public virtual Agent? Agent { get; set; }

        [ForeignKey("Seller")]
        public int? SellerId { get; set; }
        public virtual Seller? Seller { get; set; }

        [ForeignKey("Property")]
        public int? PropertyId { get; set; }
        public virtual Property? Property { get; set; }

        public virtual ICollection<PropertyBid>? PropertyBids { get; set; }  
    }

    public enum Status
    {
        Scheduled,
        Active,
        Finished
    }
}
