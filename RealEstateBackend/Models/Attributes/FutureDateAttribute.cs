using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Attributes
{
    public class FutureDateAttribute : ValidationAttribute
    {
        public FutureDateAttribute()
        {
            ErrorMessage = "Scheduled time must be in the future.";
        }

        public override bool IsValid(object? value)
        {
            if (value == null) return false;

            if (value is DateTime dateTime)
            {
                return dateTime.ToUniversalTime() > DateTime.UtcNow;
            }

            return false;
        }
    }
}
