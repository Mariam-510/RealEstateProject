namespace RealEstate.Models.Dtos.BuyerDto
{
    public class BuyerDto
    {
        public int Id { get; set; }

        public string FirstName { get; set; }

        public string? LastName { get; set; }

        public bool IsDeleted { get; set; }

        public string? AccountId { get; set; }

        public string? Email { get; set; }
      
        public DateTime CreatedAt { get; set; }

        public string? ImageUrl { get; set; }

    }
}
