namespace RealEstate.Models.Dtos.AccountDto
{
    public class GoogleUserInfo
    {
        public string Email { get; set; }       // Required (non-nullable)
        public string? Sub { get; set; }
        public string? Name { get; set; }
        public string? GivenName { get; set; }
        public string? FamilyName { get; set; }
        public string? Picture { get; set; }
    }
}
