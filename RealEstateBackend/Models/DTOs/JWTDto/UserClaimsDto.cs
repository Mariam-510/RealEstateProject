namespace RealEstate.Models.Dtos.JWTDto
{
    public class UserClaimsDto
    {
        public int UserId { get; set; }
        public string FirstName { get; set; }
        public string? LastName { get; set; }
        public string? ImageUrl { get; set; }

    }
}
