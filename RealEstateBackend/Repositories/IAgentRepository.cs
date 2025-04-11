using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IAgentRepository
    {
        Task<List<Agent>> GetAllAsync();
        Task<Agent?> GetByIdAsync(int id);
        Task<Agent?> GetByAccountIdAsync(string accountId);
        Task<bool> CommercialRegisterExistsAsync(string commercialRegister);
        Task<Agent> CreateAsync(Agent agent);
        Task<Agent?> UpdateAsync(int id, Agent agent);
        Task<Agent?> DeleteAsync(int id);
        Task<bool> ExistsAsync(int id);

    }
}
