using AutoMapper;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.AccountDto;
using RealEstate.Models.Dtos.SubscriptionDto;

namespace RealEstate.Mapping
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles() 
        {
            CreateMap<RegisterSellerOrBuyerDto, Account>().ReverseMap();

            CreateMap<RegisterSellerOrBuyerDto, Seller>().ReverseMap();

            CreateMap<RegisterSellerOrBuyerDto, Buyer>().ReverseMap();

            CreateMap<RegisterAgentDto, Account>().ReverseMap();

            CreateMap<RegisterAgentDto, Agent>().ReverseMap();

            CreateMap<Payment, Agent>().ReverseMap();

            CreateMap<Subscription, SubscriptionDto>().ReverseMap();
            CreateMap<CreateSubscriptionDto, Subscription>();

            CreateMap<SubscriptionPlan, SubscriptionPlanDto>().ReverseMap();
            CreateMap<CreateSubscriptionPlanDto, SubscriptionPlan>();

        }
    }
}
