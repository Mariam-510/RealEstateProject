using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
namespace RealEstate.Models.DTOs.AddressDto
{
    public class AddressDto
    {
        public int Id { get; set; }
        public string City { get; set; }
        public string Street { get; set; }
        public string BuildingNum { get; set; }
        public string Apartment { get; set; }
        public string Floor { get; set; }
        public string PhoneNum { get; set; }
        public string? BuyerId { get; set; }
    }
}
