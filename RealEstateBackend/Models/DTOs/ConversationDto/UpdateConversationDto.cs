using RealEstate.Models.Domains;
using System.ComponentModel.DataAnnotations;

namespace RealEstate.Models.DTOs.ConversationDto
{
    public class UpdateConversationDto
    {
        public int Id { get; set; }

        [EnumDataType(typeof(ConversationStatus))]
        public ConversationStatus Status { get; set; }

        [DataType(DataType.DateTime)]
        public DateTime? LastMessageAt { get; set; }
    }
}
