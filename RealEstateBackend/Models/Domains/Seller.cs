using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Models.Domains
{
    public class Seller
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(50)]
        [MinLength(3)]
        [RegularExpression("^[a-zA-Z\\s]+$", ErrorMessage = "Name must contain only letters.")]
        public string Name { get; set; }

        public bool IsDeleted { get; set; } = false;

        [ForeignKey("Account")]
        public string? AccountId { get; set; }
        public virtual Account? Account { get; set; }

        public virtual ICollection<Property>? Properties { get; set; }

    }
}
