using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.VisualBasic;
using RealEstate.Hubs;
using RealEstate.Mapping;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.ConversationDto;
using RealEstate.Repositories;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class ConversationsController : ControllerBase
    {
        private readonly IHubContext<ChatHub> _hubContext;
        public IConversationRepository _conversationRepository { get; }
        public UserManager<Account> _userManager { get; }

        public ConversationsController(IConversationRepository conversationRepository, UserManager<Account> userManager, IHubContext<ChatHub> hubContext)
        {
            _conversationRepository = conversationRepository;
            _userManager = userManager;
            _hubContext = hubContext;
        }

        [HttpGet]
        [Route("GetById/{conversationId}")]
        public async Task<IActionResult> GetByConversationId(int conversationId)
        {
            var currentUserAccountId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (currentUserAccountId == null) return Unauthorized();

            var conversation = await _conversationRepository.GetByIdAsync(conversationId);
            if (conversation == null)
                return NotFound("Conversation not found!");

            if (conversation.FirstAccountId != currentUserAccountId &&
                conversation.SecondAccountId != currentUserAccountId)
                return BadRequest("You don't have access to this conversation.");

            var response = conversation.ConversationResponseDto();

            return Ok(response);
        }

        [HttpGet]
        [Route("GetAll")]
        [Authorize(Roles = "Buyer,Seller,Agent")]
        public async Task<IActionResult> GetAll()
        {
            var currentUserAccountId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (currentUserAccountId == null) return Unauthorized();

            var conversations = await _conversationRepository.GetAllAsync(currentUserAccountId);
            if (conversations == null || !conversations.Any())
                return NotFound("No conversations found!");

            var response = conversations.Select(c => c.ConversationResponseDto()).ToList();

            return Ok(response);
        }

        [HttpGet("GetConversation")]
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> GetConversationBetweenUsers(string SecondAccountId)
        {
            var FirstAccountId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (FirstAccountId == null) return Unauthorized();

            if (SecondAccountId == null)
                return NotFound("Reciever not found!");

            var conversation = await _conversationRepository.GetByAccountIdsAsync(FirstAccountId, SecondAccountId);

            if (conversation == null)
                return NotFound("Conversation not found!");

            var response = conversation.ConversationResponseDto();
            return Ok(response);
        }

        [HttpPut]
        [Route("UpdateStatus/{conversationId}/{status}")]
        [Authorize(Roles = "Seller,Agent")]
        public async Task<IActionResult> UpdateConversationStatus(int conversationId, string status)
        {
            var currentUserAccountId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (currentUserAccountId == null) return Unauthorized();

            var conversation = await _conversationRepository.GetByIdAsync(conversationId);
            if (conversation == null)
                return NotFound("Conversation not found");

            bool isRecipient = conversation.SecondAccountId == currentUserAccountId;
            if (!isRecipient)
                return BadRequest("Only the recipient can update conversation status");

            var currentUser = await _userManager.FindByIdAsync(currentUserAccountId);
            var isSellerOrAgent = await _userManager.IsInRoleAsync(currentUser, "Seller") ||
                                 await _userManager.IsInRoleAsync(currentUser, "Agent");

            if (!isSellerOrAgent)
                return BadRequest("Only sellers/agents can update conversation status");

            if (conversation.Status != ConversationStatus.Pending)
                return BadRequest("Can only update status of pending conversations");

            conversation.Status = status == "Active" ? ConversationStatus.Active : ConversationStatus.Closed;

            conversation.LastMessageAt = DateTime.Now;
            await _conversationRepository.UpdateAsync(conversation);

            var response = conversation.ConversationResponseDto();

            await _hubContext.Clients
                .Groups(conversation.FirstAccountId, conversation.SecondAccountId)
                .SendAsync("ConversationStatusUpdated", response);

            return Ok(response);
        }

        [HttpGet("IsConversationExisting")]
        [Authorize(Roles = "Buyer")]
        public async Task<bool> ExistingConversation(string SecondAccountId)
        {
            var FirstAccountId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (FirstAccountId == null) return false;

            var conversationExists = await _conversationRepository.ExistsAsync(FirstAccountId, SecondAccountId);
            if (conversationExists)
                return true;

            return false;
        }

        [HttpPost]
        [Route("Create")]
        [Authorize(Roles = "Buyer")]
        //public async Task<IActionResult> Create([FromBody]CreateConversationDto createConversationDto)
        public async Task<IActionResult> CreateConversation(string SecondAccountId)
        {
            var FirstAccountId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (FirstAccountId == null) return Unauthorized();

            if (SecondAccountId == null)
                return NotFound("Reciever not found!");

            //var currentUserAccountId = User.FindFirst("UserAccountId")?.Value;

            var sender = await _userManager.FindByIdAsync(FirstAccountId);
            if (sender == null)
                return NotFound("Sender account not found.");

            if (!await _userManager.IsInRoleAsync(sender, "Buyer"))
                return BadRequest("Only buyers can initiate conversations.");

            var recipient = await _userManager.FindByIdAsync(SecondAccountId);
            if (recipient == null)
                return NotFound("Recipient account not found.");

            var recipientRoles = await _userManager.GetRolesAsync(recipient);
            if (!recipientRoles.Any(r => r == "Seller" || r == "Agent"))
                return BadRequest("You can only message sellers or agents!");

            bool conversationExists = await _conversationRepository.ExistsAsync(sender.Id, recipient.Id, ConversationStatus.Active);

            if (conversationExists)
                return BadRequest("An active conversation already exists between these users.");

            var newConversation = new Conversation
            {
                FirstAccount = sender,
                FirstAccountId = sender.Id,
                SecondAccount = recipient,
                SecondAccountId = recipient.Id,
                Status = ConversationStatus.Pending,
            };

            var createdConversation = await _conversationRepository.AddAsync(newConversation);

            var response = createdConversation.ConversationResponseDto();

            return Ok(response);
        }

        //[HttpPut]
        //[Route("Update")]
        //public async Task<IActionResult> Update([FromBody] UpdateConversationDto updateConversationDto, string currentUserAccountId = "415f3e96-5745-4341-b9c2-5d154eef02fe")
        //{
        //    //var currentUserAccountId = User.FindFirst("UserAccountId")?.Value;

        //    if (updateConversationDto == null)
        //        return BadRequest("Invalid conversation data!");

        //    var conversation = await _conversationRepository.GetByIdAsync(updateConversationDto.Id);
        //    if (conversation == null)
        //        return NotFound("Conversation not found!");

        //    bool isParticipant = conversation.FirstAccountId == currentUserAccountId
        //              || conversation.SecondAccountId == currentUserAccountId;

        //    if (!isParticipant)
        //        return BadRequest("Only participants can update conversations!");

        //    var currentUser = await _userManager.FindByIdAsync(currentUserAccountId);
        //    var currentUserRole = (await _userManager.GetRolesAsync(currentUser)).FirstOrDefault();

        //    if (updateConversationDto.Status == ConversationStatus.Active &&
        //        conversation.Status == ConversationStatus.Pending)
        //    {
        //        bool isRecipient = conversation.SecondAccountId == currentUserAccountId;
        //        bool isSellerOrAgent = currentUserRole == "Seller" || currentUserRole == "Agent";

        //        if (!isRecipient || !isSellerOrAgent)
        //            return BadRequest("Only the recipient seller/agent can accept conversations!");
        //    }

        //    if (conversation.Status == ConversationStatus.Closed)
        //        return BadRequest("Closed conversations cannot be modified!");

        //    conversation.Status = updateConversationDto.Status;
        //    conversation.LastMessageAt = updateConversationDto.LastMessageAt ?? conversation.LastMessageAt;

        //    await _conversationRepository.UpdateAsync(conversation);

        //    return Ok(new ConversationResponseDto
        //    {
        //        Id = conversation.Id,
        //        Status = conversation.Status,
        //        LastMessageAt = conversation.LastMessageAt,
        //        FirstAccountId = conversation.FirstAccountId,
        //        SecondAccountId = conversation.SecondAccountId
        //    });
        //}

        [HttpDelete]
        [Route("Delete/{conversationId}")]
        public async Task<IActionResult> Delete(int conversationId, string currentUserAccountId = "415f3e96-5745-4341-b9c2-5d154eef02fe")
        {
            //var currentUserAccountId = User.FindFirst("UserAccountId")?.Value;

            var existingConversation = await _conversationRepository.GetByIdAsync(conversationId);
            if (existingConversation == null)
                return NotFound("Conversation not found!");

            if (existingConversation.FirstAccountId != currentUserAccountId &&
                existingConversation.SecondAccountId != currentUserAccountId)
                return BadRequest("Only conversation participants can delete!");

            existingConversation = await _conversationRepository.DeleteAsync(conversationId);
            return Ok("Conversation deleted successfully.");
        }
    }
}
