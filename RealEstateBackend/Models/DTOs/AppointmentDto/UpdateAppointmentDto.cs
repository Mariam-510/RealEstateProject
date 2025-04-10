using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.AppointmentDto
{
    public class UpdateAppointmentDto
    {
        [Required]
        public string Status { get; set; }
    }
}
