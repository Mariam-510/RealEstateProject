using System.ComponentModel.DataAnnotations;

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

        [Required]
        public bool IsAuction { get; set; }

        [Required]
        public string Status { get; set; }

        public int? AgentId { get; set; }

        public int? SellerId { get; set; }

        // Upload files from form
        [Required]
        public ICollection<IFormFile> Images { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            // XOR logic: Exactly one must be provided
            if ((AgentId == null && SellerId == null) || (AgentId != null && SellerId != null))
            {
                yield return new ValidationResult(
                    "Exactly one of AgentId or SellerId must be provided (not both)."
                );
            }
        }
    }
}
