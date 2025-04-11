using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Dtos.AdminDto
{
    public class CreateAdminDto
    {
        [Required]
        [MaxLength(50)]
        [MinLength(1)]
        public string Name { get; set; }

        [Required]
        [EmailAddress]
        [RegularExpression(@"^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$", ErrorMessage = "Email is not valid.")]
        public string Email { get; set; }

        [Required]
        public string Password { get; set; }

        [Required]
        [Compare("Password")]
        public string ConfirmPassword { get; set; }

        public IFormFile? Image { get; set; }
    
    }
}
