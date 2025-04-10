using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IMessageRepository
    {
        Task<Message> GetByIdAsync(int id);

        Task<List<Message>> GetByConversationIdAsync(int conversationId);

        //Task<List<Message>> GetByIdAsync(string accountId);

        Task<Message> AddAsync(Message message);

        Task<Message> UpdateAsync(Message message);

        Task<Message> DeleteAsync(int id);
    }
}
