using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;
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

        public async Task<List<Property>> GetAllAsync()
        {
            return await _context.Properties.Where(p=>!p.IsDeleted)
                                  .Include(p => p.Auction)
                                  .Include(p=>p.Seller)
                                  .Include(p=>p.Agent)
                                  .ToListAsync();
        }
        public async Task<List<Property>> GetAllBySellerIdAsync(int sellerId)
        {
            return await _context.Properties
                .Where(p => p.SellerId == sellerId && !p.IsDeleted)
                .Include(p => p.Auction)
                .Include (p => p.Seller)
                .Include(p => p.Agent)
                .ToListAsync();
        }

        public async Task<List<Property>> GetAllByAgentIdAsync(int agentId)
        {
            return await _context.Properties
                .Where(p => p.AgentId == agentId && !p.IsDeleted)
                .Include(p => p.Auction)
                .Include(p => p.Seller)
                .Include(p => p.Agent)
                .ToListAsync();
        }
        public async Task<Property?> GetByIdAsync(int id)
        {
            return await _context.Properties
                                 .Where(p => !p.IsDeleted)
                                  .Include(p => p.Auction)
                                  .Include(p => p.Seller)
                                  .Include(p => p.Agent)
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
            var query = _context.Properties.Where(p => !p.IsDeleted); 

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

            return await query.Include(p => p.Auction).ToListAsync();
        }
    }
}
   
