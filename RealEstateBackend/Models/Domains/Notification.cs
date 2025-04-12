using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using Microsoft.Identity.Client;

namespace RealEstate.Models.Domains
{
    public class Notification
    {
        [Key]
        public int Id { get; set; }

        [MaxLength(200)]
        public string? Title { get; set; }

        [MaxLength(200)]
        public string Message { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.Now;

        public bool IsDeleted { get; set; } = false;

        [ForeignKey("Account")]
        public string? AccountId { get; set; }
        public virtual Account? Account { get; set; }
    }
}
