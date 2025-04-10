using RealEstate.Models.Domains;

namespace RealEstate.Models.DTOs.ConversationDto
{
    public class ConversationResponseDto
    {
        public int Id { get; set; }
        public string FirstAccountId { get; set; }
        public string SecondAccountId { get; set; }
        public ConversationStatus Status { get; set; }
        public DateTime? LastMessageAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
