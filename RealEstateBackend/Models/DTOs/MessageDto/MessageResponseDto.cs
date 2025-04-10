using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.MessageDto
{
    public class MessageResponseDto
    {
        public int Id { get; set; }
        public string Content { get; set; }
        public DateTime SentAt { get; set; }
        public MessageStatus Status { get; set; }
        public string? SenderId { get; set; }
        public int? ConversationId { get; set; }
    }
}
