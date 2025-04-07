using System.ComponentModel.DataAnnotations;
using Microsoft.AspNetCore.Identity;

namespace RealEstate.Models.Domains
{
    public class Account : IdentityUser
    {
        [DataType(DataType.DateTime)]
        public DateTime CteatedAt { get; set; } = DateTime.Now;

        public virtual ICollection<Message>? Messages { get; set; }

        public virtual ICollection<Conversation>? FirstParticipantConversations { get; set; }

        public virtual ICollection<Conversation>? SecondParticipantConversations { get; set; }

    }
}
