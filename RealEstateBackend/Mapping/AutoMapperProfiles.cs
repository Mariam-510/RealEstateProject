using AutoMapper;
using RealEstate.Models.Domains;

using RealEstate.Models.DTOs.AddressDto;
using RealEstate.Models.DTOs.AppointmentDto;
using RealEstate.Models.DTOs.PropertyBidDto;
using RealEstate.Models.DTOs.PropertyDto;

using RealEstate.Models.DTOs.Product;
using RealEstate.Models.Dtos.AccountDto;

using RealEstate.Models.Dtos.AgentDto;
using RealEstate.Models.Dtos.BuyerDto;
using RealEstate.Models.Dtos.SellerDto;
using RealEstate.Models.Dtos.OrderItemDto;
using RealEstate.Models.Dtos.CartDto;


using RealEstate.Models.Dtos.SubscriptionDto;


namespace RealEstate.Mapping
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles() 
        {

            CreateMap<Property, PropertyDto>();
            CreateMap<CreatePropertyDto, Property>();
            CreateMap<UpdatePropertyDto, Property>().
            ForMember(dest => dest.Images, opt => opt.Ignore()); // Ignore Images


            CreateMap<Appointment, AppointmentDto>()
                .ForMember(dest => dest.BuyerName, opt => 
                opt.MapFrom(src => src.Buyer != null ?$"{src.Buyer.FirstName} {src.Buyer.LastName}" : null))
                .ForMember(dest => dest.PropertyTitle, opt => 
                opt.MapFrom(src => src.Property != null ?src.Property.Title : null))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

           CreateMap<CreateAppointmentDto, Appointment>();

            CreateMap<CreatePropertyBidDto, PropertyBid>()
               .ForMember(dest => dest.Timestamp, opt => opt.MapFrom(src => DateTime.Now))
               .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => false));
            CreateMap<PropertyBid, PropertyBidDto>();

            CreateMap<Address, CreateAddressDto>().ReverseMap();
            CreateMap<Address, UpdateAddressDto>().ReverseMap();
            CreateMap<Address, AddressDto>().ReverseMap();


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

            CreateMap<Cart, CartDto>()
                .ForMember(dest => dest.OrderItemDtos, opt => opt.MapFrom(src => src.OrderItems));

            CreateMap<CreateOrderItemDto, OrderItem>().ReverseMap();

            CreateMap<OrderItemDto, OrderItem>().ReverseMap();

            CreateMap<Payment, Agent>().ReverseMap();

            CreateMap<Subscription, SubscriptionDto>().ReverseMap();
            CreateMap<CreateSubscriptionDto, Subscription>();

            CreateMap<SubscriptionPlan, SubscriptionPlanDto>().ReverseMap();
            CreateMap<CreateSubscriptionPlanDto, SubscriptionPlan>();

        }
    }
}
