using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.MessageDto
{
    public class UpdateMessageDto
    {
        [Required]
        [MaxLength(300)]
        [MinLength(1)]
        public string Content { get; set; }

        [EnumDataType(typeof(MessageStatus))]
        public MessageStatus Status { get; set; }
    }
}
