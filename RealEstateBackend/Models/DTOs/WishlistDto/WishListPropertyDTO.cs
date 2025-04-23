using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.Wishlist
{
    public class WishListPropertyDTO
    {
        [Required]
        public int PropertyID { get; set; }
    }
}
