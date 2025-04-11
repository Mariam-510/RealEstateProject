using AutoMapper;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.Product;
using RealEstate.Models.Dtos.AccountDto;
using RealEstate.Models.Dtos.AgentDto;
using RealEstate.Models.Dtos.BuyerDto;
using RealEstate.Models.Dtos.SellerDto;

namespace RealEstate.Mapping
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles() 
        {
            CreateMap<Product, ProductDTO>().ReverseMap();
            CreateMap<RegisterSellerOrBuyerDto, Account>().ReverseMap();

            CreateMap<RegisterSellerOrBuyerDto, Seller>().ReverseMap();

            CreateMap<RegisterSellerOrBuyerDto, Buyer>().ReverseMap();

            CreateMap<RegisterAgentDto, Account>().ReverseMap();

            CreateMap<RegisterAgentDto, Agent>().ReverseMap();

            CreateMap<Seller, SellerDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Account.CreatedAt))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Account.Email));

            CreateMap<SellerFormDto, Seller>().ReverseMap();

            CreateMap<Buyer, BuyerDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Account.CreatedAt))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Account.Email));

            CreateMap<BuyerFormDto, Buyer>().ReverseMap();


            CreateMap<Agent, AgentDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Account.CreatedAt))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Account.Email));

            CreateMap<AgentFormDto, Agent>().ReverseMap();
            
            CreateMap<Payment, Agent>().ReverseMap();

        }
    }
}
