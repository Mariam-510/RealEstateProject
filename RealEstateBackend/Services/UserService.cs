using RealEstate.Models.DTOs.AccountDto;
using RealEstate.Repositories;

namespace RealEstate.Services
{
    public class UserService
    {
        private readonly IBuyerRepository buyerRepository;
        private readonly ISellerRepository sellerRepository;
        private readonly IAgentRepository agentRepository;

        public UserService(IBuyerRepository buyerRepo, ISellerRepository sellerRepo, IAgentRepository agentRepo)
        {
            buyerRepository = buyerRepo;
            sellerRepository = sellerRepo;
            agentRepository = agentRepo;
        }

        public async Task<UserDto?> GetUserByAccountIdAsync(string accountId)
        {
            var buyer = await buyerRepository.GetByAccountIdAsync(accountId);
            if (buyer != null)
            {
                return new UserDto
                {
                    UserId = buyer.Id,
                    FirstName = buyer.FirstName,
                    LastName = buyer.LastName,
                    AccountId = buyer.AccountId!,
                    Roles = ["Buyer"]
                };
            }

            var seller = await sellerRepository.GetByAccountIdAsync(accountId);
            if (seller != null)
            {
                return new UserDto
                {
                    UserId = seller.Id,
                    FirstName = seller.FirstName,
                    LastName = seller.LastName,
                    AccountId = seller.AccountId!,
                    Roles = ["Seller"]
                };
            }

            var agent = await agentRepository.GetByAccountIdAsync(accountId);
            if (agent != null)
            {
                return new UserDto
                {
                    UserId = agent.Id,
                    FirstName = agent.Name,
                    LastName = null,
                    AccountId = agent.AccountId!,
                    Roles = ["Agent"]
                };
            }

            return null;
        }
    }
}
