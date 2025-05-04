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
using RealEstate.Models.Dtos.PaymentDto;
using System.Globalization;
using RealEstate.Models.Dtos.AuctionBuyerDto;


namespace RealEstate.Mapping
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles() 
        {

            //CreateMap<Property, PropertyDto>();

            CreateMap<Property, PropertyDto>()
                // Map UserName: Seller.FirstName -> Agent.FirstName
                .ForMember(dest => dest.AddedDate, opt => opt.MapFrom(src => 
                    src.AddedDate.ToString("MMM dd, yyyy", CultureInfo.InvariantCulture)
                ))
                .ForMember(dest => dest.Date, opt => opt.MapFrom(src =>
                      src.AddedDate
                ))
                .ForMember(dest => dest.UserName, opt => opt.MapFrom(src =>
                    src.Seller != null
                        ? src.Seller.FirstName + " " + src.Seller.LastName
                        : src.Agent != null
                            ? src.Agent.Name
                            : null
                ))
                .ForMember(dest => dest.UserImage, opt => opt.MapFrom(src =>
                    src.Seller != null
                        ? src.Seller.Account != null
                            ? src.Seller.Account.ImageUrl
                            : null
                        : src.Agent != null
                            ? src.Agent.Account != null
                                ? src.Agent.Account.ImageUrl
                                : null
                            : null
                ));

            CreateMap<CreatePropertyDto, Property>();
            
            CreateMap<UpdatePropertyDto, Property>()
                .ForMember(dest => dest.Images, opt => opt.Ignore()); // Ignore Images

            //------------------------------------------------------------------------------------------------
            CreateMap<Appointment, AppointmentDto>()
                .ForMember(dest => dest.BuyerName, opt => 
                opt.MapFrom(src => src.Buyer != null ?$"{src.Buyer.FirstName} {src.Buyer.LastName}" : null))
                .ForMember(dest => dest.PropertyTitle, opt => 
                opt.MapFrom(src => src.Property != null ?src.Property.Title : null))
                .ForMember(dest => dest.Status, opt => opt.MapFrom(src => src.Status.ToString()));

            //------------------------------------------------------------------------------------------------

           CreateMap<CreateAppointmentDto, Appointment>();

            //------------------------------------------------------------------------------------------------

            CreateMap<CreatePropertyBidDto, PropertyBid>();
               //.ForMember(dest => dest.Timestamp, opt => opt.MapFrom(src => DateTime.Now.AddHours(1)))
               //.ForMember(dest => dest.IsDeleted, opt => opt.MapFrom(src => false));
            
            CreateMap<PropertyBid, PropertyBidDto>()
                .ForMember(dest => dest.BuyerFirstName, opt => opt.MapFrom(src => src.Buyer.FirstName))
                .ForMember(dest => dest.BuyerLastName, opt => opt.MapFrom(src => src.Buyer.LastName))
                .ForMember(dest => dest.BuyerImage, opt => opt.MapFrom(src => src.Buyer.Account.ImageUrl));

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
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Account.CreatedAt.ToString("MMM dd, yyyy", CultureInfo.InvariantCulture)))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Account.Email))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.Account.ImageUrl));
                
            CreateMap<SellerFormDto, Seller>().ReverseMap();

            //------------------------------------------------------------------------------------------------

            CreateMap<Buyer, BuyerDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Account.CreatedAt.ToString("MMM dd, yyyy", CultureInfo.InvariantCulture)))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Account.Email))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.Account.ImageUrl));

            CreateMap<BuyerFormDto, Buyer>().ReverseMap();

            //------------------------------------------------------------------------------------------------

            CreateMap<Agent, AgentDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Account.CreatedAt.ToString("MMM dd, yyyy", CultureInfo.InvariantCulture)))
                .ForMember(dest => dest.Email, opt => opt.MapFrom(src => src.Account.Email))
                .ForMember(dest => dest.ImageUrl, opt => opt.MapFrom(src => src.Account.ImageUrl));

            CreateMap<AgentFormDto, Agent>().ReverseMap();

            //------------------------------------------------------------------------------------------------

            CreateMap<Admin, AdminDto>()
                .ForMember(dest => dest.CreatedAt, opt => opt.MapFrom(src => src.Account.CreatedAt.ToString("MMM dd, yyyy", CultureInfo.InvariantCulture)))
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
                        : null))
                    .ForMember(dest => dest.CategoryName,
                    opt => opt.MapFrom(src => src.Product != null && src.Product.Category != null
                        ? src.Product.Category.Name
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

            CreateMap<Payment, PaymentDto>()
                .ForMember(dest => dest.PaymentMethod,
                           opt => opt.MapFrom(src => src.PaymentMethod.ToString()))
                .ForMember(dest => dest.PaidAt,
                           opt => opt.MapFrom(src => src.PaidAt.ToString("yyyy-MM-dd HH:mm:ss"))) // Or another format if preferred
                .ReverseMap()
                .ForMember(dest => dest.PaymentMethod,
                           opt => opt.MapFrom(src => Enum.Parse<PaymentMethod>(src.PaymentMethod)))
                .ForMember(dest => dest.PaidAt,
                           opt => opt.MapFrom(src => DateTime.Parse(src.PaidAt)));

            //------------------------------------------------------------------------------------------------

            CreateMap<AuctionBuyer, AuctionBuyerDto>().ReverseMap();

            CreateMap<AuctionBuyer, CreateAuctionBuyerDto>().ReverseMap();

        }
    }
}
