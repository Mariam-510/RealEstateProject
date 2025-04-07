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
        public DateTime ScheduledTime { get; set; }

        public AppointmentType Type { get; set; } 

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
}
