using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Dtos.AgentDto
{
    public class AgentFormDto
    {
        [Required]
        [MaxLength(50)]
        [MinLength(1)]
        public string Name { get; set; }

        public string? CurrentPassword { get; set; }

        public string? NewPassword { get; set; }

        [Compare("NewPassword")]
        public string? ConfirmNewPassword { get; set; }

        public IFormFile? Image { get; set; }

        public bool RemoveImage { get; set; }
    }
}
