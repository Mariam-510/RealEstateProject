using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.SubscriptionDto;
using RealEstate.Repositories;
using Stripe;

namespace RealEstate.Services
{
    public class SubscriptionService
    {
        private readonly ISubscriptionRepository _subscriptionRepository;

        public SubscriptionService(ISubscriptionRepository subscriptionRepository)
        {
            _subscriptionRepository = subscriptionRepository;
        }



        //public async Task CheckAndUpdateSubscriptionStatusAsync(int userId)
        //{
        //    var subscription = await _subscriptionRepository.GetCurrentActiveByUserIdAsync(userId);
        //    if (subscription == null) return;

        //    if (DateTime.Now > subscription.EndDate && subscription.SubscriptionStatus != SubscriptionStatus.Expired)
        //    {
        //        subscription.SubscriptionStatus = SubscriptionStatus.Expired;
        //        await _subscriptionRepository.UpdateAsync(subscription);
        //    }
        //}

        public async Task<bool> CanAddMorePropertiesAsync(int userId)
        {
            var subscription = await _subscriptionRepository.GetCurrentActiveByUserIdAsync(userId);

            if (subscription == null)
                return false;

            return subscription.AvailableProperties > 0;
        }

        public async Task<bool> DecreaseAvailablePropertiesByOne(int userId)
        {
            var subscription = await _subscriptionRepository.GetCurrentActiveByUserIdAsync(userId);

            if (subscription == null)
                return false;

            if (subscription.AvailableProperties > 0)
            {
                subscription.AvailableProperties--;

                await _subscriptionRepository.UpdateAsync(subscription);
            }
            return true;
        }
              



    }
}
