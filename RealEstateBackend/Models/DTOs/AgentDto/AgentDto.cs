namespace RealEstate.Models.Dtos.AgentDto
{
    public class AgentDto
    {
        public int Id { get; set; }

        public string Name { get; set; }

        public string CommercialRegister { get; set; }

        public bool IsDeleted { get; set; }

        public string? AccountId { get; set; }

        public string? Email { get; set; }

        public DateTime CteatedAt { get; set; }
    }
}
