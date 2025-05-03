using System.Security.Claims;
using System.Transactions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using RealEstate.Hubs;
using RealEstate.Mapping;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.ConversationDto;
using RealEstate.Models.DTOs.MessageDto;
using RealEstate.Repositories;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class MessagesController : ControllerBase
    {
        public IMessageRepository _messageRepository { get; }
        public IConversationRepository _conversationRepository { get; }

        private readonly IHubContext<ChatHub> _hubContext;
        public UserManager<Account> _userManager { get; }

        public MessagesController(IMessageRepository messageRepository, IConversationRepository conversationRepository, IHubContext<ChatHub> hubContext, UserManager<Account> userManager)
        {
            _messageRepository = messageRepository;
            _conversationRepository = conversationRepository;
            _userManager = userManager;
            _hubContext = hubContext;
        }

        [HttpGet]
        [Route("GetById/{messageId}")]
        public async Task<IActionResult> GetById(int messageId, string currentUserAccountId = "415f3e96-5745-4341-b9c2-5d154eef02fe")
        {
            //var currentUserAccountId = User.FindFirst("UserAccountId")?.Value;

            var message = await _messageRepository.GetByIdAsync(messageId);
            if (message == null)
                return NotFound("Message not found!");

            bool isParticipant = message.Conversation.FirstAccountId == currentUserAccountId
                      || message.Conversation.SecondAccountId == currentUserAccountId;

            if (!isParticipant)
                return BadRequest("You are not part of this conversation.");

            var response = message.MessageResponseDto();

            return Ok(response);
        }

        [HttpGet]
        [Route("GetAllMessages/{conversationId}")]
        public async Task<IActionResult> GetByConversationId(int conversationId)
        {
            var currentUserAccountId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (currentUserAccountId == null) return Unauthorized();

            //var currentUserAccountId = User.FindFirst("UserAccountId")?.Value;

            var conversation = await _conversationRepository.GetByIdAsync(conversationId);
            if (conversation == null)
                return NotFound("Conversation not found!");

            if (conversation.FirstAccountId != currentUserAccountId &&
                conversation.SecondAccountId != currentUserAccountId)
                return BadRequest("You don't have access to this conversation.");

            var messages = await _messageRepository.GetByConversationIdAsync(conversationId);
            if (messages == null || !messages.Any())
                return NotFound("No messages found for this conversation!");

            var response = messages.Select(m => m.MessageResponseDto());

            return Ok(response);
        }

        [HttpPost]
        [Route("Create")]
        [Authorize(Roles = "Buyer,Seller,Agent")]
        public async Task<IActionResult> CreateMessage([FromBody] CreateMessageDto createMessageDto)
        {
            if (createMessageDto == null)
                return BadRequest("Invalid message data!");

            var currentUserAccountId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (currentUserAccountId == null) return Unauthorized();

            //Get receiver account id through conversation
            var conversation = await _conversationRepository.GetByIdAsync(createMessageDto.ConversationId);
            if (conversation == null)
                return NotFound("Conversation not found!");

            string otherUserId = conversation.FirstAccountId == currentUserAccountId
                ? conversation.SecondAccountId
                : conversation.FirstAccountId;

            bool isParticipant = conversation.FirstAccountId == currentUserAccountId
                      || conversation.SecondAccountId == currentUserAccountId;

            if (!isParticipant)
                return BadRequest("You are not part of this conversation.");

            var currentUser = await _userManager.FindByIdAsync(currentUserAccountId);
            var currentUserRole = (await _userManager.GetRolesAsync(currentUser)).FirstOrDefault();

            if (conversation.Status == ConversationStatus.Closed)
                return BadRequest("This conversation is closed");

            if (conversation.Status == ConversationStatus.Pending)
            {
                var existingMessages = await _messageRepository.GetByConversationIdAsync(conversation.Id);

                // Only allow one message when conversation is pending
                if (existingMessages.Any())
                    return BadRequest("Cannot send more messages until the conversation is accepted");

                if (currentUserRole != "Buyer")
                    return BadRequest("Only buyer can initiate conversation");
            }

            var newMessage = new Message
            {
                Content = createMessageDto.Content,
                SenderId = currentUserAccountId,
                ConversationId = conversation.Id,
                SentAt = DateTime.Now
            };

            var addedMessage = await _messageRepository.AddAsync(newMessage);

            conversation.LastMessageAt = DateTime.Now;
            await _conversationRepository.UpdateAsync(conversation);

            var response = addedMessage.MessageResponseDto();

            //Update chat realtime 
            await _hubContext.Clients.Group(otherUserId).SendAsync("ReceiveMessage", response);

            return Ok(response);
        }

        //[HttpPost]
        //[Route("Update")]
        //public async Task<IActionResult> Update([FromBody]UpdateMessageDto updateMessageDto)
        //{
        //    //int currentUserId = 0;
        //    //int.TryParse(User.FindFirst("UserId")?.Value, out currentUserId);

        //    string currentUserAccountId = User.FindFirst("UserAccountId")?.Value;

        //    if (updateMessageDto == null)
        //        return BadRequest("Invalid message data!");

        //    var updatedMessage = updateMessageDto.EditMessageDto();

        //    var existingMessage = await _messageRepository.GetByIdAsync(updatedMessage.Id);
        //    if (existingMessage == null)
        //        return NotFound("Message not found!");

        //    var conversation = await _conversationRepository.GetByMessageIdAsync(existingMessage.Id);
        //    if (conversation == null)
        //        return NotFound("Conversation not found!");

        //    bool isRecipient = conversation.FirstAccountId == currentUserAccountId
        //                    || conversation.SecondAccountId == currentUserAccountId;

        //    if (!isRecipient)
        //        return Forbid("Only the recipient can accept/deny messages.");

        //    if (existingMessage.Status == MessageStatus.Pending)
        //    {
        //        // Only allow transitioning to Accepted/Rejected
        //        if (updateMessageDto.Status != MessageStatus.Sent
        //            && updateMessageDto.Status != MessageStatus.Rejected)
        //        {
        //            return BadRequest("Pending messages can only transition to Sent or Rejected.");
        //        }
        //    }


        //    await _messageRepository.UpdateAsync(existingMessage);

        //    if (updateMessageDto.Status == MessageStatus.Rejected)
        //    {
        //        // Auto-archive conversation if rejected
        //        conversation.Status = ConversationStatus.Closed;
        //        await _conversationRepository.UpdateAsync(conversation);
        //    }

        //    // 8. Optional: Update conversation status if first acceptance
        //    else if (updateMessageDto.Status == MessageStatus.Sent && conversation.Status == ConversationStatus.Pending)
        //    {
        //        conversation.Status = ConversationStatus.Active;
        //        await _conversationRepository.UpdateAsync(conversation);
        //    }
        //    return Ok(updatedMessage);
        //}

        //[HttpDelete]
        //[Route("Delete/{messageId}")]
        //public async Task<IActionResult> Delete(int messageId)
        //{
        //    var currentUserAccountId = User.FindFirst("UserAccountId")?.Value;

        //    var existingMessage = await _messageRepository.GetByIdAsync(messageId);
        //    if (existingMessage == null)
        //        return NotFound("Message not found!");

        //    if (existingMessage.SenderId != currentUserAccountId)
        //        return Forbid("You can only delete your own messages.");

        //    existingMessage = await _messageRepository.DeleteAsync(messageId);
        //    return Ok("Message deleted successfully.");
        //}
    }
}
