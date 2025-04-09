using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public interface IWishListRepository
    {
        Task<Wishlist?> CreateProductAsync(Wishlist wishlist);
        Task<Wishlist?> CreatePropertyAsync(Wishlist wishlist);
        Task<Wishlist?> UpdateProductAsync(int BuyerID, int ProductID, bool isDeleted);
        Task<Wishlist?> UpdatePropertyAsync(int BuyerID, int propertyID, bool isDeleted);
        Task<List<Property?>> GetAllPropertyByBuyerIDAsync(int BuyerID);
        Task<List<Product?>> GetAllProductByBuyerIDAsync(int BuyerID);
        Task<Wishlist?> GettByBuyerAndProductIdAsync(int productID, int BuyerID);
        Task<Wishlist?> GettByBuyerAndpropertyIdAsync(int propertyID, int BuyerID);

    }
}
