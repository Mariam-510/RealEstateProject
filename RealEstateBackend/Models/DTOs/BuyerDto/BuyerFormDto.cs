using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Dtos.BuyerDto
{
    public class BuyerFormDto
    {
        [Required]
        [MaxLength(50)]
        [MinLength(1)]
        [RegularExpression("^[a-zA-Z]+$", ErrorMessage = "Name must contain only letters.")]
        public string FirstName { get; set; }

        [MaxLength(50)]
        [MinLength(1)]
        [RegularExpression("^[a-zA-Z]+$", ErrorMessage = "Name must contain only letters.")]
        public string? LastName { get; set; }

        public string? CurrentPassword { get; set; }

        public string? NewPassword { get; set; }

        [Compare("NewPassword")]
        public string? ConfirmNewPassword { get; set; }
    }
}
