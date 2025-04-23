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
using RealEstate.Models.Dtos.AdminDto;
using RealEstate.Models.Dtos.ContractDto;
using RealEstate.Models.Dtos.ShippingDto;
using RealEstate.Models.Dtos.SubscriptionPlanDto;
using RealEstate.Models.Dtos.ProductStockDto;
using RealEstate.Models.DTOs.Category;


namespace RealEstate.Mapping
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles() 
        {

            CreateMap<Property, PropertyDto>();
            
            CreateMap<CreatePropertyDto, Property>();
            
            CreateMap<UpdatePropertyDto, Property>()
                .ForMember(dest => dest.Images, opt => opt.Ignore()); // Ignore Images

            CreateMap<Appointment, AppointmentDto>()
                .ForMember(dest => dest.BuyerName, opt => 
                opt.MapFrom(src => src.Buyer != null ?$"{src.Buyer.FirstName} {src.Buyer.LastName}" : null))
                .ForMember(dest => dest.PropertyTitle, opt => 
                opt.MapFrom(src => src.Property != null ?src.Property.Title : null))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

            //------------------------------------------------------------------------------------------------

           CreateMap<CreateAppointmentDto, Appointment>();

            //------------------------------------------------------------------------------------------------

            CreateMap<CreatePropertyBidDto, PropertyBid>()
               .ForMember(dest => dest.Timestamp, opt => opt.MapFrom(src => DateTime.Now))
               .ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => false));
            
            CreateMap<PropertyBid, PropertyBidDto>();

            //------------------------------------------------------------------------------------------------

            CreateMap<Address, CreateAddressDto>().ReverseMap();
            
            CreateMap<Address, UpdateAddressDto>().ReverseMap();

            CreateMap<Address, AddressDto>().ReverseMap();

            //------------------------------------------------------------------------------------------------

            CreateMap<RegisterSellerOrBuyerDto, Account>().ReverseMap();

            CreateMap<RegisterSellerOrBuyerDto, Seller>().ReverseMap();

            CreateMap<RegisterSellerOrBuyerDto, Buyer>().ReverseMap();

            CreateMap<RegisterAgentDto, Account>().ReverseMap();

            CreateMap<RegisterAgentDto, Agent>().ReverseMap();

            CreateMap<CreateAdminDto, Account>().ReverseMap();

            CreateMap<CreateAdminDto, Admin>().ReverseMap();

            //------------------------------------------------------------------------------------------------

            CreateMap<Seller, SellerDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Account.CreatedAt))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Account.Email))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.Account.ImageUrl));
                
            CreateMap<SellerFormDto, Seller>().ReverseMap();

            //------------------------------------------------------------------------------------------------

            CreateMap<Buyer, BuyerDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Account.CreatedAt))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Account.Email))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.Account.ImageUrl));

            CreateMap<BuyerFormDto, Buyer>().ReverseMap();

            //------------------------------------------------------------------------------------------------

            CreateMap<Agent, AgentDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Account.CreatedAt))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Account.Email))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.Account.ImageUrl));

            CreateMap<AgentFormDto, Agent>().ReverseMap();

            //------------------------------------------------------------------------------------------------

            CreateMap<Admin, AdminDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Account.CreatedAt))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Account.Email))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.Account.ImageUrl));

            CreateMap<AdminFormDto, Admin>().ReverseMap();

            //------------------------------------------------------------------------------------------------

            CreateMap<CreateOrderItemDto, OrderItem>().ReverseMap();

            CreateMap<OrderItem, OrderItemDto>()
                .ForMember(dest => dest.ProductName, opt => opt.MapFrom(src => src.Product != null ? src.Product.Name : null))
                .ForMember(dest => dest.ProductDescription, opt => opt.MapFrom(src => src.Product != null ? src.Product.Description : null))
                .ForMember(dest => dest.ProductImage, opt => opt.MapFrom(
                    src => src.Product != null && src.Product.Images != null && src.Product.Images.Count > 0
                        ? src.Product.Images[0]
                        : null));

            //------------------------------------------------------------------------------------------------

            CreateMap<Cart, CartDto>()
                .ForMember(dest => dest.OrderItemDtos, opt => opt.MapFrom(src => src.OrderItems));

            //------------------------------------------------------------------------------------------------
            //********************************************

            CreateMap<Payment, Agent>().ReverseMap();

            //------------------------------------------------------------------------------------------------

            CreateMap<Subscription, SubscriptionDto>().ReverseMap();
            
            CreateMap<CreateSubscriptionDto, Subscription>();

            //------------------------------------------------------------------------------------------------

            CreateMap<SubscriptionPlan, SubscriptionPlanDto>().ReverseMap();
            
            CreateMap<CreateSubscriptionPlanDto, SubscriptionPlan>().ReverseMap();

            //------------------------------------------------------------------------------------------------

            CreateMap<ContractDto, Contract>().ReverseMap();

            //------------------------------------------------------------------------------------------------

            CreateMap<ShippingDto, Shipping>().ReverseMap();

            CreateMap<ShippingFormDto, Shipping>().ReverseMap();

            //------------------------------------------------------------------------------------------------

            CreateMap<Category, CategoryDTO>().ReverseMap();

            //------------------------------------------------------------------------------------------------

            CreateMap<ProductStock, ProductStockDto>().ReverseMap();

            CreateMap<ProductStock, ProductStockFormDto>().ReverseMap();

            //------------------------------------------------------------------------------------------------

            //CreateMap<Product, ProductDTO>().ReverseMap();

            //CreateMap<Product, ProductDTOShow>().ReverseMap();

        }
    }
}
