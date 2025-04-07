using System.ComponentModel;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace RealEstate.Models.Domains
{
    public class Conversation
    {
        [Key]
        public int Id { get; set; }

        [ForeignKey("FirstAccount")]
        public string? FirstAccountId { get; set; }

        [ForeignKey("SecondAccount")]
        public string? SecondAccountId { get; set; }
        public ConversationStatus Status { get; set; } = ConversationStatus.Pending;
        public DateTime CreatedAt { get; set; } = DateTime.Now;
        public DateTime? LastMessageAt { get; set; }
        public bool IsDeleted { get; set; }
        public virtual Account? FirstAccount { get; set; }
        public virtual Account? SecondAccount { get; set; }
        public virtual ICollection<Message>? Messages { get; set; }
    }

    public enum ConversationStatus
    {
        Active,
        Pending
    }
}
