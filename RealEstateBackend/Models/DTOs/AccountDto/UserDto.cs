namespace RealEstate.Models.DTOs.AccountDto
{
    public class UserDto
    {
        public string AccountId { get; set; }  // From NameIdentifier
        public int? UserId { get; set; }
        public string Email { get; set; }  // From custom userId claim
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public string ImageUrl { get; set; }
        public List<string> Roles { get; set; }  // Roles (array if multiple)
        public DateTime? TokenExpiration { get; set; }
    }
}
