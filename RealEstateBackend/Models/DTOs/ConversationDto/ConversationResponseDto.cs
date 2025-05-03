using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.AccountDto;

namespace RealEstate.Models.DTOs.ConversationDto
{
    public class ConversationResponseDto
    {
        public int Id { get; set; }
        public string FirstAccountId { get; set; }
        //public Account FirstAccount { get; set; }
        public string SecondAccountId { get; set; }
        //public Account SecondAccount { get; set; }
        public string Status { get; set; }
        public DateTime? LastMessageAt { get; set; }
        public DateTime CreatedAt { get; set; }
    }
}
