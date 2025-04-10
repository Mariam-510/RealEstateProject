using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IConversationRepository
    {
        Task<Conversation> GetByIdAsync(int conversationId);

        Task<Conversation> GetByMessageIdAsync(int messageId);

        Task<List<Conversation>> GetAllAsync(string accountId);

        Task<bool> ExistsAsync(string account1Id, string account2Id, ConversationStatus? status = null);

        Task<Conversation> AddAsync(Conversation conversation);

        Task<Conversation> UpdateAsync(Conversation conversation);

        Task<Conversation> DeleteAsync(int conversationId);
    }
}
