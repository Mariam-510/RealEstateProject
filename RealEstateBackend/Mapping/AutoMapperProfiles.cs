using AutoMapper;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.AccountDto;

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


        }
    }
}
