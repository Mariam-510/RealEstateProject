using System.Security.Claims;
using Google;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using RealEstate.Hubs.Model;

namespace RealEstate.Hubs.Controller
{
    // Controllers/ChatController.cs
    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ChatController : ControllerBase
    {
        //private readonly ApplicationDbContext _context;
        private readonly IHubContext<ChatHub> _hubContext;

        public ChatController(/*ApplicationDbContext context,*/ IHubContext<ChatHub> hubContext)
        {
            //_context = context;
            _hubContext = hubContext;
        }

        //[HttpGet("history/{otherUserId}")]
        //public async Task<IActionResult> GetChatHistory(string otherUserId)
        //{
        //    var currentUserId = User.FindFirst("userId")?.Value;
        //    if (currentUserId == null) return Unauthorized();

        //    var messages = await _context.ChatMessages
        //        .Where(m => (m.SenderId == currentUserId && m.ReceiverId == otherUserId) ||
        //                    (m.SenderId == otherUserId && m.ReceiverId == currentUserId))
        //        .OrderBy(m => m.SentAt)
        //        .ToListAsync();

        //    return Ok(messages);
        //}

        // ChatController.cs
        [HttpPost("send")]
        public async Task<IActionResult> SendMessage([FromBody] SendMessageDto dto)
        {
            var currentUserId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (currentUserId == null) return Unauthorized();

            // Send to receiver (direct user targeting)
            await _hubContext.Clients.User(dto.ReceiverId)
                .SendAsync("ReceiveMessage", currentUserId, dto.Content);

            // Echo to sender
            await _hubContext.Clients.User(currentUserId)
                .SendAsync("ReceiveMessage", currentUserId, dto.Content);

            return Ok();
        }

    }

    public class SendMessageDto
    {
        public string ReceiverId { get; set; }
        public string Content { get; set; }
    }
}
