namespace RealEstate.Models.Dtos.AdminDto
{
    public class AdminDto
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public bool IsDeleted { get; set; }

        public string? AccountId { get; set; }

        public string? Email { get; set; }

        public DateTime CreatedAt { get; set; }

        public string? ImageUrl { get; set; }
    }
}
