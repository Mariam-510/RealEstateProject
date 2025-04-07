using System;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Attributes
{
    [AttributeUsage(AttributeTargets.Property | AttributeTargets.Field, AllowMultiple = false)]
    public class NonNegativeAttribute : ValidationAttribute
    {
        protected override ValidationResult IsValid(object value, ValidationContext validationContext)
        {
            if (value == null)
            {
                return ValidationResult.Success; // Let [Required] handle null cases
            }

            switch (value)
            {
                case int intValue when intValue < 0:
                    return new ValidationResult("Value must be non-negative.");
                case decimal decimalValue when decimalValue < 0:
                    return new ValidationResult("Value must be non-negative.");
                case double doubleValue when doubleValue < 0:
                    return new ValidationResult("Value must be non-negative.");
            }

            return ValidationResult.Success;
        }
    }
}
