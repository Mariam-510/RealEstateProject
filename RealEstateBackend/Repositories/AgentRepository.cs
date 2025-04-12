using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{

    public class AgentRepository : IAgentRepository
    {
        private readonly RealEstateDbContext dbContext;
        public AgentRepository(RealEstateDbContext dbontext)
        {
            this.dbContext = dbontext;
        }

        public async Task<List<Agent>> GetAllAsync(ApprovalStatus? approvalStatus = null)
        {
            var query = dbContext.Agents
                .Include(a => a.Account)
                .Where(a => !a.IsDeleted);

            if (approvalStatus.HasValue)
            {
                query = query.Where(a => a.ApprovalStatus == approvalStatus.Value);
            }

            return await query.ToListAsync();
        }

        public async Task<Agent?> GetByIdAsync(int id)
        {
            return await dbContext.Agents
                .Include(a => a.Account)
                .Where(a => !a.IsDeleted)
                .FirstOrDefaultAsync(a => a.Id == id);
        }

        public async Task<Agent?> GetByAccountIdAsync(string accountId)
        {
            return await dbContext.Agents
                .Include(a => a.Account)
                .Where(a => !a.IsDeleted)
                .FirstOrDefaultAsync(a => a.Account.Id == accountId);
        }

        public async Task<bool> CommercialRegisterExistsAsync(string commercialRegister)
        {
            return await dbContext.Agents.AnyAsync(a => a.CommercialRegister == commercialRegister && !a.IsDeleted);
        }

        public async Task<Agent> CreateAsync(Agent agent)
        {
            await dbContext.Agents.AddAsync(agent);
            await dbContext.SaveChangesAsync();
            return agent;
        }

        public async Task<Agent?> UpdateAsync(int id, Agent agent)
        {
            var existingAgent = await dbContext.Agents
                .Include(a => a.Account)
                .Where(a => !a.IsDeleted)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (existingAgent == null)
            {
                return null;
            }
            existingAgent.Name = agent.Name;

            await dbContext.SaveChangesAsync();
            return existingAgent;
        }

        public async Task<Agent?> UpdateIsApprovedAsync(int id, ApprovalStatus approvalStatus)
        {
            var existingAgent = await dbContext.Agents
                .Include(a => a.Account)
                .Where(a => !a.IsDeleted)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (existingAgent == null)
            {
                return null;
            }
            existingAgent.ApprovalStatus = approvalStatus;

            await dbContext.SaveChangesAsync();
            return existingAgent;
        }

        public async Task<Agent?> DeleteAsync(int id)
        {
            var existingAgent = await dbContext.Agents
                .Include(a => a.Account)
                .Where(a => !a.IsDeleted)
                .FirstOrDefaultAsync(a => a.Id == id);

            if (existingAgent == null)
            {
                return null;
            }
            existingAgent.IsDeleted = true;
            //existingAgent.AccountId = null;

            await dbContext.SaveChangesAsync();
            return existingAgent;
        }

        public async Task<bool> ExistsAsync(int id)
        {
            return await dbContext.Agents.AnyAsync(a => a.Id == id && !a.IsDeleted);
        }

    }
}

