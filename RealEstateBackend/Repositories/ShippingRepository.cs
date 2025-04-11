using RealEstate.Data;

namespace RealEstate.Repositories
{
    public class ShippingRepository : IShippingRepository
    {
        private readonly RealEstateDbContext dbContext;
        public ShippingRepository(RealEstateDbContext dbontext)
        {
            this.dbContext = dbontext;
        }
    }
}
