using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace RealEstate.Models.Domains
{
    public class Account : IdentityUser
    {
        [DataType(DataType.DateTime)]
        public DateTime CreatedAt { get; set; } = DateTime.Now.AddHours(1);

        public bool IsDeleted { get; set; } = false;

        public string? EmailConfirmationCode { get; set; }

        public DateTime? CodeGeneratedAt { get; set; }

        public string? PasswordResetCode { get; set; }
        
        public DateTime? ResetCodeGeneratedAt { get; set; }

        public string? ImageUrl { get; set; }

        public virtual ICollection<Message>? Messages { get; set; }

        public virtual ICollection<Conversation>? FirstParticipantConversations { get; set; }

        public virtual ICollection<Conversation>? SecondParticipantConversations { get; set; }

        public virtual ICollection<Notification>? Notifications { get; set; }
    }
}
