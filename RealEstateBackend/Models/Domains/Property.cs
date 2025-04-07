using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
namespace RealEstate.Models.Domains
{
    public class Property
    {
        [Key]
        public int Id { get; set; }

        public string Title { get; set; } 

        public string? Description { get; set; } 

        public string Location { get; set; }

        [EnumDataType(typeof(PropertyType))]
        public PropertyType Type { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }

        public bool IsAuction { get; set; } = false;

        [EnumDataType(typeof(PropertyStatus))]
        public PropertyStatus Status { get; set; }

        [EnumDataType(typeof(PropertyCategory))]
        public PropertyCategory PropertyCategory { get; set; }

        public bool IsDeleted { get; set; } = false;

        [ForeignKey("Agent")]
        public int? AgentId { get; set; }
        public virtual Agent? Agent { get; set; }

        [ForeignKey("Seller")]
        public int? SellerId { get; set; }
        public virtual Seller? Seller { get; set; }

        [ForeignKey("Auction")]
        public int? AuctionId { get; set; }
        public virtual Auction? Auction { get; set; } 

        public virtual ICollection<Wishlist>? WishlistItems { get; set; }

        public virtual ICollection<Appointment>? Appointments { get; set; }

    }
    public enum PropertyCategory
    {
        Apartment,
        Villa,
        House,
        Studio,
        Penthouse,
        Duplex,
        Townhouse,
        Mansion
    }
    public enum PropertyStatus
    {
        Available,
        Sold,
        Auctioned
    }
    public enum PropertyType
    {
        Sell,
        Rent
    }
}
