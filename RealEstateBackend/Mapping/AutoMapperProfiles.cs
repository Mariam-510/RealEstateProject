using AutoMapper;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.Product;

namespace RealEstate.Mapping
{
    public class AutoMapperProfiles : Profile
    {
        public AutoMapperProfiles() 
        {
            CreateMap<Product, ProductDTO>().ReverseMap();


        }
    }
}
