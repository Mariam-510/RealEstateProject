using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.ConversationDto;
using RealEstate.Models.DTOs.MessageDto;

namespace RealEstate.Mapping
{
    public static class ManualMapperProfiles
    {
        //----------------------------------------------------------------------------------------
        // Conversation

        public static ConversationResponseDto ConversationResponseDto(this Conversation conversation)
        {
            return new ConversationResponseDto
            {
                Id = conversation.Id,
                Status = conversation.Status,
                CreatedAt = conversation.CreatedAt,
                LastMessageAt = conversation.LastMessageAt,
                FirstAccountId = conversation.FirstAccountId,
                SecondAccountId = conversation.SecondAccountId
            };
        }

        //----------------------------------------------------------------------------------------
        // Messages

        public static MessageResponseDto MessageResponseDto(this Message message)
        {
            return new MessageResponseDto
            {
                Id = message.Id,
                Content = message.Content,
                SenderId = message.SenderId,
                ConversationId = message.ConversationId,
                Status = message.Status,
                SentAt = message.SentAt
            };
        }

        //----------------------------------------------------------------------------------------
        //Order

        
    }
}
