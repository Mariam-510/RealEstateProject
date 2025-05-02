using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Models.Domains
{
    public class Message
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [MaxLength(300)]
        [MinLength(1)]
        public string Content { get; set; }

        [DataType(DataType.DateTime)]
        public DateTime SentAt { get; set; } = DateTime.Now;

        public bool IsDeleted { get; set; } = false;
        
        [ForeignKey("Sender")]
        public string? SenderId { get; set; }
        public virtual Account? Sender { get; set; }

        [ForeignKey("Conversation")]
        public int? ConversationId { get; set; }
        public virtual Conversation? Conversation { get; set; }
    }
}
