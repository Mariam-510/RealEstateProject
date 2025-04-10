using RealEstate.Models.Attributes;
using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.AppointmentDto
{
    public class CreateAppointmentDto
    {
        [Required]
        [FutureDate] // Custom attribute
        public DateTime ScheduledTime { get; set; }

        [Required]
        public string Type { get; set; }

        [Required]
        public string Status { get; set; }

        [Required]
        public int BuyerId { get; set; }

        [Required]
        public int PropertyId { get; set; }
    }
}
