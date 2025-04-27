using RealEstate.Models.Attributes;
using RealEstate.Models.Domains;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Models.DTOs.PropertyDto
{
    public class CreatePropertyDto : IValidatableObject
    {
        [Required]
        public string Title { get; set; }

        [Required]
        public string? Description { get; set; }

        [Required]
        public string Location { get; set; }

        [Required]
        public decimal Price { get; set; }

        [Required]
        public string Type { get; set; }

        [Required]
        public string PropertyCategory { get; set; }

        [NonNegative]
        [Required]
        public int BedRooms { get; set; }

        [NonNegative]
        [Required]
        public int BathRooms { get; set; }

        [NonNegative]
        [Column(TypeName = "decimal(18,2)")]
        [Required]
        public decimal Space { get; set; }

        //[Required]
        //public string Status { get; set; }

        // Upload files from form
        [Required]
        public ICollection<IFormFile> Images { get; set; }
        public IFormFile? ContractFile { get; set; }
        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            // Enum validation
            if (!Enum.TryParse(typeof(PropertyType), Type, true, out _))
            {
                yield return new ValidationResult("Invalid property Type. Allowed: Sell, Rent.", new[] { nameof(Type) });
            }

            //if (!Enum.TryParse(typeof(PropertyStatus), Status, true, out _))
            //{
            //    yield return new ValidationResult("Invalid property Status. Allowed: Available, Sold, Auctioned.", new[] { nameof(Status) });
            //}

            if (!Enum.TryParse(typeof(PropertyCategory), PropertyCategory, true, out _))
            {
                yield return new ValidationResult("Invalid PropertyCategory. Allowed: Apartment, Villa, House, Studio, Penthouse, Duplex, Townhouse, Mansion.", new[] { nameof(PropertyCategory) });
            }

        }
    }
}
