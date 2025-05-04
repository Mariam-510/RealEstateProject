using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using RealEstate.Models.Domains;
using RealEstate.Repositories;
using System;
using System.Diagnostics.Metrics;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminDashboardController : ControllerBase
    {
        private readonly IAgentRepository _agentRepo;
        private readonly ISellerRepository _sellerRepo;
        private readonly IBuyerRepository _buyerRepo;
        private readonly IAdminDashboardRepository _dashboardRepo;
        private readonly IAuctionRepository _auctionRepo;
        private readonly IPropertyRepository _propertyRepo;
        private readonly IProductRepository _productRepo;
        private readonly IOrderRepository _orderRepo;


      
        public AdminDashboardController(IAgentRepository agentRepo,
            ISellerRepository sellerRepo, 
            IBuyerRepository buyerRepo,
            IAdminDashboardRepository dashboardRepo,
            IAuctionRepository auctionRepo,IPropertyRepository propertyRepo,
            IProductRepository productRepo,
            IOrderRepository orderRepo){
            _agentRepo = agentRepo;
            _sellerRepo = sellerRepo;
            _buyerRepo = buyerRepo;
            _dashboardRepo = dashboardRepo;
            _auctionRepo = auctionRepo;
            _propertyRepo = propertyRepo;
            _orderRepo = orderRepo;
            _productRepo = productRepo;
        }

        [HttpGet("totals")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetTotals()
        {
            string userIdStr = User.FindFirst("userId")?.Value;
            if (!int.TryParse(userIdStr, out int userId))
                return Unauthorized("User not found.");
            var userCounts = await _dashboardRepo.GetTotalUsers();

            var activeAuctions = await _auctionRepo.GetAllAsync(ISLivestatus: Status.Active);
            var totalActiveAuctions = activeAuctions?.Count() ?? 0;

            var auctionedProperties = await _propertyRepo.GetFilteredAsync(null,status: PropertyStatus.Auctioned,null,null);
            var availableProperties = await _propertyRepo.GetFilteredAsync(null, status: PropertyStatus.Available, null, null);
            var SoldProperties = await _propertyRepo.GetFilteredAsync(null, status: PropertyStatus.Sold, null, null);
            var SaleProperties = await _propertyRepo.GetFilteredAsync(null, null, type: PropertyType.Sell, null);
            var RentProperties = await _propertyRepo.GetFilteredAsync(null, null, type: PropertyType.Rent, null);

            var SoldPropertiesCount = SoldProperties?.Count() ?? 0;
            var SalePropertiesCount = SaleProperties?.Count() ?? 0;
            var RentPropertiesCount = RentProperties?.Count() ?? 0;

            var TotalAvailableProperties = auctionedProperties?.Count() + availableProperties?.Count();

            var UsedProducts = await _dashboardRepo.FilterProductsByStatus(true);
            var NewProducts=await _dashboardRepo.FilterProductsByStatus(false);
            var TotalProducts = UsedProducts + NewProducts;
            var SoldProducts = await _dashboardRepo.GetTotalSoldProducts();

            var Orders = await _orderRepo.GetAllAsync();
            var TotalOrders =Orders?.Count() ?? 0;

            var HighestSellBid = await _dashboardRepo.GetHighestSellBidAsync();
            var HighestRentBid = await _dashboardRepo.GetHighestRentBidAsync();

            int UpcomingAuctions = await _dashboardRepo.GetUpcomingAuctionsCountAsync();
            int EndingAuctions = await _dashboardRepo.GetEndingAuctionsCountAsync();
            var ActiveAuctionsPrecentage = await _dashboardRepo.GetActiveAuctionsPercentageAsync();

            var CategoryPercentages = await _dashboardRepo.GetCategoryPercentagesAsync();
            var Counts = await _dashboardRepo.GetSubscriptionCountsAsync();
            var TopProducts = await _dashboardRepo.GetTopSoldProductsAsync();


            return Ok(new {
                totalSellers= userCounts.Sellers,
                totalAgents = userCounts.Agents,
                totalBuyers =userCounts.Buyers,
                totalUsers = userCounts.Total, 
                activeAuctions = totalActiveAuctions ,
                availableProperties= TotalAvailableProperties, 
                soldProperties= SoldPropertiesCount,
                saleProperties= SalePropertiesCount,
                RentProperties= RentPropertiesCount,
                usedProducts=UsedProducts,
                newProducts=NewProducts,
                totalOrders= TotalOrders,
                soldProducts= SoldProducts,
                totalProducts =TotalProducts,
                highestSellBid = HighestSellBid,
                highestRentBid = HighestRentBid,
                upcomingAuctions = UpcomingAuctions,
                endingAuctions = EndingAuctions,
                activeAuctionsPrecentage = ActiveAuctionsPrecentage,
                categoryPercentages=CategoryPercentages,
                subscriptionPlans = Counts.Keys.ToArray(),
                subscriptionCounts = Counts,
                topProducts = TopProducts,

            });
        }


    }
}
