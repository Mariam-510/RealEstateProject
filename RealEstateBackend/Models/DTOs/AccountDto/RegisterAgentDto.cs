using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Dtos.AccountDto
{
    public class RegisterAgentDto
    {
        [Required]
        [MaxLength(50)]
        [MinLength(1)]
        public string Name { get; set; }

        [Required]
        [RegularExpression(@"^\d{6,8}$", ErrorMessage = "Commercial Register must be between 6 and 8 digits.")]
        public string CommercialRegister { get; set; }

        [Required]
        [EmailAddress]
        [RegularExpression(@"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$", ErrorMessage = "Email is not valid.")]
        public string Email { get; set; }

        [Required]
        [DataType(DataType.Password)]
        public string Password { get; set; }

        [Required]
        [Compare("Password")]
        [DataType(DataType.Password)]
        public string ConfirmPassword { get; set; }

    }
}
