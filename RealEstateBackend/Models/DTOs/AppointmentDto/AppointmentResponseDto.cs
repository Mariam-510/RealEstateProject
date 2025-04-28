using RealEstate.Models.Domains;

namespace RealEstate.Models.DTOs.AppointmentDto
{
    public class AppointmentResponseDto
    {
        public int Id { get; set; }
        public DateTime ScheduledTime { get; set; }
        public string Type { get; set; }
        public string Status { get; set; } = AppointmentStatus.Pending.ToString(); // default status
        public AppointmentPropertyDto Property { get; set; }
    }

    public class AppointmentPropertyDto
    {
        public int Id { get; set; }
        public string Title { get; set; }
        //public string Description { get; set; }
        public string Location { get; set; }
        public decimal Price { get; set; }
        public string Type { get; set; } // Sell or Rent
                                         //public string PropertyCategory { get; set; }
                                         //public int BedRooms { get; set; }
                                         //public int BathRooms { get; set; }
                                         //public decimal Space { get; set; }
                                         //public DateTime AddedDate { get; set; }
                                         //public string Status { get; set; }
        public List<string> Images { get; set; }
        public int? agentId { get; set; }
        public int? sellerId { get; set; }
        public string? userName { get; set; }
        public string? userImage { get; set; }
        public string? userType { get; set; }

        //public string? ContractImgUrl { get; set; }
        //public bool IsFavorite { get; set; } = false;

        //public string? UserName { get; set; }
        //public string? UserImage { get; set; }
    }
}