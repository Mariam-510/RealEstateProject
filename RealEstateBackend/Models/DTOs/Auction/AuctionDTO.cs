using System.ComponentModel.DataAnnotations;
using RealEstate.Models.Attributes;
using RealEstate.Models.Domains;

namespace RealEstate.Models.DTOs.Auction
{
    public class AuctionDTO : IValidatableObject
    {
        [Required]
        [FutureDate]
        public DateTime StartTime { get; set; }

        [Required]
        [FutureDate]
        public DateTime EndTime { get; set; }

        [Required]
        [NonNegative]
        public decimal StartPrice { get; set; }


        [Required]
        public int PropertyId { get; set; }

        public int? AgentId { get; set; }

        public int? SellerId { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if ((AgentId == null && SellerId == null) || (AgentId != null && SellerId != null))
            {
                yield return new ValidationResult(
                    "Exactly one of AgentId or SellerId must be provided (not both)."
                );
            }
        }
    }
}
