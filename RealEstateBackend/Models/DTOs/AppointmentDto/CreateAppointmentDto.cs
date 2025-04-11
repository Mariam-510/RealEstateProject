using Microsoft.Extensions.Logging;
using RealEstate.Models.Attributes;
using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.AppointmentDto
{
    public class CreateAppointmentDto:IValidatableObject
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
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
         
            // Enum validation
            if (!Enum.TryParse(typeof(AppointmentType), Type, true, out _))
            {
                yield return new ValidationResult("Invalid Appointment Type . Allowed: Virtual, InPerson.", new[] { nameof(Type) });
            }

            if (!Enum.TryParse(typeof(AppointmentStatus), Status, true, out _))
            {
                yield return new ValidationResult("Invalid Appointment Status. Allowed: Pending, Cancelled, Completed.", new[] { nameof(Status) });
            }

           

        }

    }
}
