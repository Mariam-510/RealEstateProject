using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.PropertyDto;
using System;

namespace RealEstate.Repositories
{
    public class PropertyRepository:IPropertyRepository
    {
        private readonly RealEstateDbContext _context;

        public PropertyRepository(RealEstateDbContext context)
        {
            _context = context;
        }

        public async Task<List<Property>> GetAllPending()
        {
            return await _context.Properties.Where(p => !p.IsDeleted && p.ApprovalStatus == PropertyApprovalStatus.Pending)
                                  .Include(p => p.Seller)
                                  .ThenInclude(S => S.Contracts)
                                  .ToListAsync();
        }
        public async Task<List<Property>> GetAllBySellerIdAsync(int sellerId)
        {
            return await _context.Properties
                .Where(p => p.SellerId == sellerId && !p.IsDeleted )
                .Include (p => p.Seller)
                .ThenInclude(p=>p.Contracts)
                .OrderByDescending(p=>p.AddedDate)
                .ToListAsync();
        }

        public async Task<List<Property>> GetApprovedBySellerIdAsync(int sellerId)
        {
            return await _context.Properties
                .Where(p => p.SellerId == sellerId && !p.IsDeleted && p.ApprovalStatus == PropertyApprovalStatus.Approved)
                .Include(p => p.Seller)
                .Include(p => p.Agent)
                .ToListAsync();
        }
        
        public async Task<List<Property>> GetPendingBySellerIdAsync(int sellerId)
        {
            return await _context.Properties
                .Where(p => p.SellerId == sellerId && !p.IsDeleted && p.ApprovalStatus == PropertyApprovalStatus.Pending)
                .Include(p => p.Seller).ThenInclude(S => S.Contracts)
                .Include(p => p.Agent)
                .ToListAsync();
        }
        
        public async Task<List<Property>> GetRejectedBySellerIdAsync(int sellerId)
        {
            return await _context.Properties
                .Where(p => p.SellerId == sellerId && !p.IsDeleted && p.ApprovalStatus == PropertyApprovalStatus.Rejected)
                .Include(p => p.Seller)
                .Include(p => p.Agent)
                .ToListAsync();
        }

        public async Task<List<Property>> GetAllByAgentIdAsync(int agentId)
        {
            return await _context.Properties
                .Where(p => p.AgentId == agentId && !p.IsDeleted)
                .Include(p => p.Seller)
                .Include(p => p.Agent)
                .ToListAsync();
        }
        
        public async Task<Property?> GetByIdAsync(int id)
        {
            return await _context.Properties
                                 .Where(p => !p.IsDeleted)
                                 .Include(p => p.Seller).ThenInclude(s => s.Account)
                                 .Include(p => p.Agent).ThenInclude(a => a.Account)
                                 .FirstOrDefaultAsync(p => p.Id == id);
        }

        public async Task AddAsync(Property property)
        {
            _context.Properties.Add(property);
            await _context.SaveChangesAsync();
        }

        public async Task UpdateAsync(Property property)
        {
            _context.Properties.Update(property);
            await _context.SaveChangesAsync();
        }

        public async Task DeleteAsync(int id)
        {
            var property = await GetByIdAsync(id);
            if (property != null)
            {
                property.IsDeleted = true;
                _context.Properties.Update(property);
                await _context.SaveChangesAsync();
            }
        }

        public async Task<List<Property>> GetFilteredAsync(PropertyCategory? category, PropertyStatus? status, PropertyType? type, string searchByLocation)
        {
            var query = _context.Properties
                .Include(p => p.Seller).ThenInclude(s=>s.Account)
                .Include(p => p.Agent).ThenInclude(a => a.Account)
                .Where(p => !p.IsDeleted && p.ApprovalStatus==PropertyApprovalStatus.Approved); 

            if (!string.IsNullOrWhiteSpace(category?.ToString())) 
            {
                query = query.Where(p =>
                    p.PropertyCategory.ToString().ToLower().Contains(category.ToString().ToLower()));
            }

            if (!string.IsNullOrWhiteSpace(status?.ToString())) 
            {
                query = query.Where(p =>
                    p.Status.ToString().ToLower().Contains(status.ToString().ToLower()));
            }

            if (!string.IsNullOrWhiteSpace(type?.ToString())) 
            {
                query = query.Where(p =>
                    p.Type.ToString().ToLower().Contains(type.ToString().ToLower()));
            }

            // Location search (case-insensitive search)
            if (!string.IsNullOrEmpty(searchByLocation))
            {
                query = query
                    .Where(p => p.Location.ToLower().Contains(searchByLocation.ToLower()))
                    .OrderByDescending(p => p.Location.ToLower() == searchByLocation.ToLower()) // exact match
                    .ThenByDescending(p => p.Location.ToLower().StartsWith(searchByLocation.ToLower())) // starts with
                    .ThenByDescending(p => p.Location.ToLower().Contains(searchByLocation.ToLower())); // contains
            }

            return await query.ToListAsync();
        }

        public async Task<int> GetFilteredBySellerIdAsync(int sellerId, PropertyType? type = null, PropertyStatus? status = null)
        {
            var query = _context.Properties
                .Include(p => p.Seller).ThenInclude(s => s.Account)
                .Where(p => !p.IsDeleted && p.SellerId == sellerId && p.ApprovalStatus == PropertyApprovalStatus.Approved);

            if (!string.IsNullOrWhiteSpace(type?.ToString()))
            {
                query = query.Where(p =>
                    p.Type.ToString().ToLower().Contains(type.ToString().ToLower()));
            }

            if (!string.IsNullOrWhiteSpace(status?.ToString()))
            {
                query = query.Where(p =>
                    p.Status.ToString().ToLower().Contains(status.ToString().ToLower()));
            }

            return await query.CountAsync();
        }
                         
        public async Task<int> GetFilteredByAgentIdAsync(int agentId, PropertyType? type = null, PropertyStatus? status = null)
        {
            var query = _context.Properties
                .Include(p => p.Seller).ThenInclude(s => s.Account)
                .Where(p => !p.IsDeleted && p.AgentId == agentId);

            if (!string.IsNullOrWhiteSpace(type?.ToString()))
            {
                query = query.Where(p =>
                    p.Type.ToString().ToLower().Contains(type.ToString().ToLower()));
            }

            if (!string.IsNullOrWhiteSpace(status?.ToString()))
            {
                query = query.Where(p =>
                    p.Status.ToString().ToLower().Contains(status.ToString().ToLower()));
            }

            return await query.CountAsync();
        }

        public async Task<decimal> GetTotalSalesBySellerID(int sellerId)
        {
            return await _context.Properties
                .Where(p => p.SellerId == sellerId && p.Status == PropertyStatus.Sold && p.Type == PropertyType.Sell
                    && p.ApprovalStatus == PropertyApprovalStatus.Approved)
                .SumAsync(p => p.Price);
        }

        public async Task<decimal> GetTotalRentalsBySellerID(int sellerId)
        {
            return await _context.Properties
                .Where(p => p.SellerId == sellerId && p.Status == PropertyStatus.Sold && p.Type == PropertyType.Rent
                    && p.ApprovalStatus == PropertyApprovalStatus.Approved)
                .SumAsync(p => p.Price);
        }

        public async Task<decimal> GetTotalSalesByAgentID(int agentId)
        {
            return await _context.Properties
                .Where(p => p.AgentId == agentId && p.Status == PropertyStatus.Sold && p.Type == PropertyType.Sell)
                .SumAsync(p => p.Price);
        }

        public async Task<decimal> GetTotalRentalsByAgentID(int agentId)
        {
            return await _context.Properties
                .Where(p => p.AgentId == agentId && p.Status == PropertyStatus.Sold && p.Type == PropertyType.Rent)
                .SumAsync(p => p.Price);
        }

        public async Task<(Property? Property, int WishlistCount)> GetHighestWishlistedPropertyBySellerIdAsync(int sellerId)
        {
            var result = await _context.Properties
                .Where(p => p.SellerId == sellerId && !p.IsDeleted)
                .Select(p => new
                {
                    Property = p,
                    WishlistCount = p.WishlistItems.Count(w => !w.IsDeleted)
                })
                .OrderByDescending(x => x.WishlistCount)
                .FirstOrDefaultAsync();

            return (result?.Property, result?.WishlistCount ?? 0);
        }

        public async Task<(Property? Property, int WishlistCount)> GetHighestWishlistedPropertyByAgentIdAsync(int agentId)
        {
            var result = await _context.Properties
                .Where(p => p.AgentId == agentId && !p.IsDeleted)
                .Select(p => new
                {
                    Property = p,
                    WishlistCount = p.WishlistItems.Count(w => !w.IsDeleted)
                })
                .OrderByDescending(x => x.WishlistCount)
                .FirstOrDefaultAsync();

            return (result?.Property, result?.WishlistCount ?? 0);
        }

        public async Task<(Property? Property, int CompletedAppointmentCount)> GetMostCompletedAppointmentsBySellerIdAsync(int sellerId)
        {
            var result = await _context.Properties
                .Where(p => p.SellerId == sellerId && !p.IsDeleted)
                .Select(p => new
                {
                    Property = p,
                    CompletedCount = p.Appointments.Count(a =>
                        a.Status == AppointmentStatus.Completed &&
                        !a.IsDeleted)
                })
                .OrderByDescending(x => x.CompletedCount)
                .FirstOrDefaultAsync();

            return (result?.Property, result?.CompletedCount ?? 0);
        }

        public async Task<(Property? Property, int CompletedAppointmentCount)> GetMostCompletedAppointmentsByAgentIdAsync(int agentId)
        {
            var result = await _context.Properties
                .Where(p => p.AgentId == agentId && !p.IsDeleted)
                .Select(p => new
                {
                    Property = p,
                    CompletedCount = p.Appointments.Count(a =>
                        a.Status == AppointmentStatus.Completed &&
                        !a.IsDeleted)
                })
                .OrderByDescending(x => x.CompletedCount)
                .FirstOrDefaultAsync();

            return (result?.Property, result?.CompletedCount ?? 0);
        }

        //for charttttttttt
        public async Task<IEnumerable<CategoryRevenueDto>> GetCategoryRevenuesBySellerIdAsync(int sellerId)
        {
            // Fetch grouped revenue data from the database
            var dbResults = await _context.Properties
                .Where(p => p.SellerId == sellerId && !p.IsDeleted && p.ApprovalStatus == PropertyApprovalStatus.Approved)
                .GroupBy(p => p.PropertyCategory)
                .Select(g => new
                {
                    Category = g.Key,
                    TotalSales = g.Where(p => p.Type == PropertyType.Sell && p.Status == PropertyStatus.Sold)
                                 .Sum(p => p.Price),
                    TotalRental = g.Where(p => p.Type == PropertyType.Rent && p.Status == PropertyStatus.Sold)
                                 .Sum(p => p.Price)
                })
                .ToListAsync();

            // Get all possible enum values for PropertyCategory
            var allCategories = Enum.GetValues(typeof(PropertyCategory))
                                    .Cast<PropertyCategory>();

            // Merge database results with all enum categories
            var result = allCategories
                .Select(c => new CategoryRevenueDto
                {
                    Category = c,
                    TotalSalesRevenue = dbResults.FirstOrDefault(r => r.Category == c)?.TotalSales ?? 0m,
                    TotalRentalRevenue = dbResults.FirstOrDefault(r => r.Category == c)?.TotalRental ?? 0m
                })
                .ToList();

            return result;
        }

        public async Task<IEnumerable<CategoryRevenueDto>> GetCategoryRevenuesByAgentIdAsync(int agentId)
        {
            // Fetch grouped revenue data from the database
            var dbResults = await _context.Properties
                .Where(p => p.AgentId == agentId && !p.IsDeleted && p.ApprovalStatus == PropertyApprovalStatus.Approved)
                .GroupBy(p => p.PropertyCategory)
                .Select(g => new
                {
                    Category = g.Key,
                    TotalSales = g.Where(p => p.Type == PropertyType.Sell && p.Status == PropertyStatus.Sold)
                                 .Sum(p => p.Price),
                    TotalRental = g.Where(p => p.Type == PropertyType.Rent && p.Status == PropertyStatus.Sold)
                                 .Sum(p => p.Price)
                })
                .ToListAsync();

            // Get all possible enum values for PropertyCategory
            var allCategories = Enum.GetValues(typeof(PropertyCategory))
                                    .Cast<PropertyCategory>();

            // Merge database results with all enum categories
            var result = allCategories
                .Select(c => new CategoryRevenueDto
                {
                    Category = c,
                    TotalSalesRevenue = dbResults.FirstOrDefault(r => r.Category == c)?.TotalSales ?? 0m,
                    TotalRentalRevenue = dbResults.FirstOrDefault(r => r.Category == c)?.TotalRental ?? 0m
                })
                .ToList();

            return result;
        }


        public async Task<List<Property>> GetAllPropertiesUnfilteredAsync()
        {
            return await _context.Properties
                .Include(p => p.Seller).ThenInclude(s => s.Account)
                .Include(p => p.Agent).ThenInclude(a => a.Account)
                .Where(p => !p.IsDeleted) 
                .ToListAsync();
        }


    }
}
   
