using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class ConversationRepository : IConversationRepository
    {
        public RealEstateDbContext _context { get; }
        
        public ConversationRepository(RealEstateDbContext context)
        {
            _context = context;
        }

        public async Task<Conversation> GetByIdAsync(int conversationId)
        {
            return await _context.Conversations
                .Include(c => c.FirstAccount)
                .Include(c => c.SecondAccount)
                .Where(c => !c.IsDeleted)
                .FirstOrDefaultAsync(c => c.Id == conversationId);
        }

        public async Task<Conversation> GetByMessageIdAsync(int messageId)
        {
            return await _context.Conversations
                .Include(c => c.FirstAccount)
                .Include(c => c.SecondAccount)
                .FirstOrDefaultAsync(c => c.Messages.Any(m => m.Id == messageId));
        }

        public async Task<List<Conversation>> GetAllAsync(string accountId)
        {
            return await _context.Conversations
                .Include(c => c.FirstAccount)
                .Include(c => c.SecondAccount)
                .Where(c => (c.FirstAccountId == accountId || c.SecondAccountId == accountId) && !c.IsDeleted)
                .OrderByDescending(c => c.LastMessageAt)
                .ToListAsync();
        }

        public async Task<bool> ExistsAsync(string account1Id, string account2Id, ConversationStatus? status = null)
        {
            return await _context.Conversations.AnyAsync(c =>
                (c.FirstAccountId == account1Id && c.SecondAccountId == account2Id) ||
                (c.FirstAccountId == account2Id && c.SecondAccountId == account1Id) &&
                (!status.HasValue || c.Status == status.Value)
            );
        }

        public async Task<Conversation> AddAsync(Conversation conversation)
        {
            if (conversation == null)
                return null;

            await _context.Conversations.AddAsync(conversation);
            await _context.SaveChangesAsync();
            return conversation;
        }

        public async Task<Conversation> UpdateAsync(Conversation conversation)
        {
            var existingConversation = await GetByIdAsync(conversation.Id);
            if (existingConversation == null)
                return null;

            _context.Conversations.Update(existingConversation);
            await _context.SaveChangesAsync();
            return conversation;
        }

        public async Task<Conversation> DeleteAsync(int conversationId)
        {
            var conversation = await GetByIdAsync(conversationId);
            if (conversation != null)
            {
                conversation.Status = ConversationStatus.Closed;
                conversation.IsDeleted = true;
                _context.Conversations.Update(conversation);
                await _context.SaveChangesAsync();
                return conversation;
            }
            else
            {
                throw new Exception("Conversation not found");
            }
        }
    }
}
