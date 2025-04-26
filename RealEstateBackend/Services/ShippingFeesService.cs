using RealEstate.Repositories;

namespace RealEstate.Services
{
    public class ShippingFeesService
    {
        private readonly IAddressRepository _addressRepository;
        private readonly IShippingRepository _shippingRepository;

        public ShippingFeesService(
            IAddressRepository addressRepository,
            IShippingRepository shippingRepository)
        {
            _addressRepository = addressRepository;
            _shippingRepository = shippingRepository;
        }

        public async Task<decimal> GetShippingFeesByAddressIdAsync(int addressId)
        {
            // Get the address by ID
            var address = await _addressRepository.GetByIdAsync(addressId);

            if (address == null)
            {
                throw new ArgumentException("Address not found", nameof(addressId));
            }

            // Get shipping fees for the city
            var shipping = await _shippingRepository.GetByCityAsync(address.City);

            // If city not found in shipping table, return average fees
            if (shipping == null)
            {
                return await _shippingRepository.GetAvgDeliveryFeesAsync();
            }

            return shipping.DeliveryFees;
        }
    }
}
