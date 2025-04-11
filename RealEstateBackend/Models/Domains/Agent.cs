using Microsoft.EntityFrameworkCore.Metadata.Internal;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Models.Domains
{
    public class Agent
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(50)]
        [MinLength(1)]
        public string Name { get; set; }

        [RegularExpression(@"^\d{6,8}$", ErrorMessage = "Commercial Register must be between 6 and 8 digits.")]
        public string CommercialRegister { get; set; }

        public bool IsDeleted { get; set; } = false;


        [ForeignKey("Account")]
        public string? AccountId { get; set; }
        public virtual Account? Account { get; set; }

        public virtual ICollection<Property>? Properties { get; set; }
       
        public virtual ICollection<Auction>? Auctions { get; set; }

    }
}
