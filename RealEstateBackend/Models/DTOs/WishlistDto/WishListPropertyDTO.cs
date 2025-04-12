using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.Wishlist
{
    public class WishListPropertyDTO
    {
        [Required]
        public int BuyerId { get; set; }
        [Required]
        public int PropertyID { get; set; }
    }
}
