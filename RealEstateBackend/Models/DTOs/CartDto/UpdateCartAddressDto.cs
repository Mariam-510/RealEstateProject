using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Dtos.CartDto
{
    public class UpdateCartAddressDto
    {
        [Required]
        public int SelectedAddressId { get; set; }
    }
}
