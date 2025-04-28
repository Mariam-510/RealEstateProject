using RealEstate.Repositories;

namespace RealEstate.Services
{
    public class CartService 
    {
        private readonly ICartRepository _cartRepository;
        private readonly IOrderItemRepository _orderItemRepository;

        public CartService(
            ICartRepository cartRepository,
            IOrderItemRepository orderItemRepository)
        {
            _cartRepository = cartRepository;
            _orderItemRepository = orderItemRepository;
        }

        public async Task ClearCart(int buyerId, int orderId)
        {
            // Get the buyer's active cart
            var cart = await _cartRepository.GetByBuyerIdAsync(buyerId);

            if (cart == null || cart.OrderItems == null || !cart.OrderItems.Any())
            {
                return; // No cart or empty cart, nothing to do
            }

            var orderItems = cart.OrderItems.ToList();

            // Transfer all items from cart to order
            foreach (var orderItem in orderItems)
            {
                // Update each order item to remove cart association and assign to order
                orderItem.CartId = null;
                orderItem.OrderId = orderId;
                await _orderItemRepository.UpdateAsync(orderItem);
            }

            // Update cart total (should be 0 after clearing)
            await _cartRepository.UpdateAsync(cart);
        }
    }
}
