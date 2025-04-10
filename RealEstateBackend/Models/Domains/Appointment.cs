using RealEstate.Models.Attributes;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Models.Domains
{
    public class Appointment
    {
        [Key]
        public int Id { get; set; }

        [DataType(DataType.DateTime)]
        [FutureDate] // Custom attribute
        public DateTime ScheduledTime { get; set; }

<<<<<<< Updated upstream
        public AppointmentType Type { get; set; } 
=======
        [EnumDataType(typeof(AppointmentType))]
        public AppointmentType Type { get; set; }
>>>>>>> Stashed changes

        [EnumDataType(typeof(AppointmentStatus))]
        public AppointmentStatus Status { get; set; } = AppointmentStatus.Pending; // default status
        public bool IsDeleted { get; set; } = false;


        [ForeignKey("Buyer")]
        public int? BuyerId { get; set; }
        public virtual Buyer? Buyer { get; set; }

        [ForeignKey("Property")]
        public int? PropertyId { get; set; }
        public virtual Property? Property { get; set; }  
    }
    public enum AppointmentType
    {
        Virtual,
        InPerson
    }
    public enum AppointmentStatus
    {
        Pending,
        Confirmed,
        Cancelled,
        Completed
    }
}
