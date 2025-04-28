using RealEstate.Models.Domains;

namespace RealEstate.Models.DTOs.PropertyDto
{
    public class CategoryRevenueDto
    {
        public PropertyCategory Category { get; set; }
        public decimal TotalSalesRevenue { get; set; }
        public decimal TotalRentalRevenue { get; set; }
    }
}
