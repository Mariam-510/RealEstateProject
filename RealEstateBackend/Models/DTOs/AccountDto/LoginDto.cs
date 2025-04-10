using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Dtos.AccountDto
{
    public class LoginDto
    {
        [Required]
        [EmailAddress]
        [RegularExpression(@"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$", ErrorMessage = "Email is not valid.")]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }
    }
}
