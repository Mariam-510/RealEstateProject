using RealEstate.Models.Attributes;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Models.DTOs.PropertyDto
{
    public class PropertyDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        public string Description { get; set; }
        public string Location { get; set; }
        public decimal Price { get; set; }
        public string Type { get; set; } // Sell or Rent
        public string PropertyCategory { get; set; }
        public int BedRooms { get; set; }
        public int BathRooms { get; set; }
        public decimal Space { get; set; }
        public DateTime AddedDate { get; set; }
        public string Status { get; set; } // Available, Sold, Auctioned
        public string ApprovalStatus { get; set; } // Pending, Approved, Rejected
        public List<string> Images { get; set; }
        public int? AgentId { get; set; }
        public int? SellerId { get; set; }
        public string? ContractImgUrl { get; set; }
        public bool IsFavorite { get; set; } = false;
        public string? UserName { get; set; }
        public string? UserImage { get; set; }


    }
}
