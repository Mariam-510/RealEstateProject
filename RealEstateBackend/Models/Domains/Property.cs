using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;
using RealEstate.Models.Attributes;
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
        [NonNegative]
        public decimal Price { get; set; }

        [EnumDataType(typeof(PropertyStatus))]
        public PropertyStatus Status { get; set; }

        [EnumDataType(typeof(PropertyCategory))]
        public PropertyCategory PropertyCategory { get; set; }

        [NonNegative]
        public int BedRooms { get; set; }

        [NonNegative]
        public int BathRooms { get; set; }
        
        [NonNegative]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Space { get; set; }

        public DateTime AddedDate { get; set; } = DateTime.Now;

        public bool IsDeleted { get; set; } = false;

        [ForeignKey("Agent")]
        public int? AgentId { get; set; }
        public virtual Agent? Agent { get; set; }

        [ForeignKey("Seller")]
        public int? SellerId { get; set; }
        public virtual Seller? Seller { get; set; }
      
        public virtual ICollection<Wishlist>? WishlistItems { get; set; }

        public virtual ICollection<Appointment>? Appointments { get; set; }

        // Store image URLs (e.g., "/images/file.jpg")
        public List<string> Images { get; set; }

        public PropertyApprovalStatus ApprovalStatus { get; set; } = PropertyApprovalStatus.Pending;

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
    public enum PropertyApprovalStatus
    {
        Pending,
        Approved,
        Rejected
    }
}
