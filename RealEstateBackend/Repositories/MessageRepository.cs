using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class MessageRepository : IMessageRepository
    {
        public RealEstateDbContext _context { get; }

        public MessageRepository(RealEstateDbContext context)
        {
            _context = context;
        }

        public async Task<Message> GetByIdAsync(int id)
        {
            return await _context.Messages.Include(m => m.Conversation).FirstOrDefaultAsync(m => m.Id == id);
        }

        public async Task<List<Message>> GetByConversationIdAsync(int conversationId)
        {
            return await _context.Messages
                .Where(m => m.ConversationId == conversationId && !m.IsDeleted)
                .OrderByDescending(m => m.SentAt)
                .ToListAsync();
        }

        //public async Task<List<Message>> GetByIdAsync(string accountId)
        //{
        //    return await _context.Messages
        //        .Where(m => m.SenderId == accountId && !m.IsDeleted)
        //        .ToListAsync();
        //}

        public async Task<Message> AddAsync(Message message)
        {
            if (message == null)
                return null;

            await _context.Messages.AddAsync(message);
            await _context.SaveChangesAsync();
            return message;
        }

        public async Task<Message> UpdateAsync(Message message)
        {
            var existingMessage = await GetByIdAsync(message.Id);

            if (existingMessage == null)
                return null;

            existingMessage.Content = message.Content;
            existingMessage.Status = message.Status;

            _context.Messages.Update(existingMessage);
            await _context.SaveChangesAsync();
            return message;
        }

        public async Task<Message> DeleteAsync(int id)
        {
            var existingMessage = await GetByIdAsync(id);

            if (existingMessage == null)
                return null;

            existingMessage.IsDeleted = true;
            _context.Messages.Update(existingMessage);
            await _context.SaveChangesAsync();
            return existingMessage;
        }
    }
}
