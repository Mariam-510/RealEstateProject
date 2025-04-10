using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.Dtos.SellerDto
{
    public class SellerDto
    {        
        public int Id { get; set; }
        
        public string FirstName { get; set; }
        
        public string? LastName { get; set; }

        public bool IsDeleted { get; set; }

        public string? AccountId { get; set; }

        public string? Email { get; set; }
        
        public DateTime CteatedAt { get; set; }

    }
}
