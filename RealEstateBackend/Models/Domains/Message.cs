using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Models.Domains
{
    public class Message
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [ForeignKey("Sender")]
        public string? SenderId { get; set; }

        [Required]
        [MaxLength(300)]
        public string Content { get; set; }

        public DateTime SentAt { get; set; } = DateTime.Now;
        public MessageStatus Status { get; set; } = MessageStatus.Pending;
        public bool IsDeleted { get; set; } = false;

        [ForeignKey("Conversation")]
        public int ConversationId { get; set; }

        public virtual Account? Sender { get; set; }

        public virtual Conversation? Conversation { get; set; }
    }

    public enum MessageStatus
    {
        Pending,
        Sent,
        Delivered,
        Read
    }
}
