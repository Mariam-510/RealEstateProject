using RealEstate.Models.Domains;

namespace RealEstate.Models.DTOs.AppointmentDto
{
    public class AppointmentDto
    {
        public int Id { get; set; }

        public DateTime ScheduledTime { get; set; }
        public string Type { get; set; }
        public string Status { get; set; }

        public int BuyerId { get; set; }
        public string BuyerName { get; set; }
        
        public int PropertyId { get; set; }
        public string PropertyTitle { get; set; }
      
    }
}
