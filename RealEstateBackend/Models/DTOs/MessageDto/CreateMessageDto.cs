using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.MessageDto
{
    public class CreateMessageDto
    {
        [Required]
        [MaxLength(300)]
        [MinLength(1)]
        public string Content { get; set; }
        public int ConversationId { get; set; }
        //public string ReceiverId { get; set; }
        //public bool? IsResponse { get; set; }
    }
}
