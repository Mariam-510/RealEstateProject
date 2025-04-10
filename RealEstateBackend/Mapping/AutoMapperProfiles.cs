using AutoMapper;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.AddressDto;
using RealEstate.Models.DTOs.AppointmentDto;
using RealEstate.Models.DTOs.PropertyBidDto;
using RealEstate.Models.DTOs.PropertyDto;

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


        }
    }
}
