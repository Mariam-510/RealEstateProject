using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.Wishlist
{
    public class WishListProductDTO
    {


        [Required]
        public int BuyerId { get; set; }
        [Required]
        public int ProductId { get; set; }

    }

}
 

