using System.ComponentModel;
using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class AuctioRepository : IAuctionRepository
    {
        public RealEstateDbContext dbcontext { get; }
        public AuctioRepository(RealEstateDbContext context)
        {
            dbcontext = context;
        }
        public async Task<Auction?> CreateAsync(Auction Auction)
        {
            if (Auction != null)
            {
                dbcontext.Auctions.Add(Auction);
                await dbcontext.SaveChangesAsync();
                return Auction;
            }
            return null;
        }

        public async Task<Auction?> DeleteAsync(int id)
        {
            Auction AuctionToDelete= await dbcontext.Auctions.Where(A => A.Id == id && A.IsDeleted == false).FirstOrDefaultAsync();
            AuctionToDelete.IsDeleted = true;
            await dbcontext.SaveChangesAsync();
            return AuctionToDelete;
        }

        public async Task<Auction?> UpdateAsync(int id, DateTime StartTime, DateTime EndTime, decimal StartPrice, Status status)
        {
            Auction AuctionToUpdate = await dbcontext.Auctions.Where(A => A.Id == id && A.IsDeleted == false).FirstOrDefaultAsync();
            AuctionToUpdate.StartTime = StartTime;
            AuctionToUpdate.EndTime = EndTime;
            AuctionToUpdate.StartPrice= StartPrice;
            AuctionToUpdate.Status = status;
            await dbcontext.SaveChangesAsync();
            return AuctionToUpdate;
        }


        public async Task<Auction?> GetByIdAsync(int id)
        {
           return await dbcontext.Auctions.Where(A=>A.Id == id && A.IsDeleted == false).FirstOrDefaultAsync();  
        }

        public async Task<Auction?> GetByProprtyIdAsync(int id)
        {
            return await dbcontext.Auctions.Where(A => A.PropertyId == id && A.IsDeleted == false).FirstOrDefaultAsync();
        }

        public async Task<List<Auction>> GetByUserID(int? AgentID = null, int? SellerID = null)
        {
            var query = dbcontext.Auctions.AsQueryable();

            if (AgentID.HasValue)
                query = query.Where(a => a.AgentId == AgentID);

            if (SellerID.HasValue)
                query = query.Where(a => a.SellerId == SellerID);

            query = query.Where(a => a.IsDeleted == false);

            return await query.ToListAsync();
        }

        public async Task<List<Auction?>> GetAllAsync(string? sortByPrice = null, string? sortByTime = null, Status? ISLivestatus = null)
        {
            var Auction = dbcontext.Auctions.Where(A => A.IsDeleted == false).AsQueryable();
            if (Auction == null)
            {
                return null;
            }
            if (ISLivestatus.HasValue)
            {
                Auction = Auction.Where(A => A.Status == ISLivestatus.Value);
            }

            if (!string.IsNullOrEmpty(sortByPrice))
            {
                switch (sortByPrice.ToLower())
                {
                    case "a":
                        Auction = Auction.OrderBy(A => A.StartPrice);
                        break;
                    case "d":
                        Auction = Auction.OrderByDescending(p => p.StartPrice);
                        break;
                    default:
                        Auction = Auction.OrderByDescending(p => p.StartPrice);
                        break;
                }
            }
            else
            {
                Auction = Auction.OrderBy(p => p.StartPrice);
            }

            if (!string.IsNullOrEmpty(sortByTime))
            {
                switch (sortByTime.ToLower())
                {
                    case "a":
                        Auction = Auction.OrderBy(A => A.StartTime);
                        break;
                    case "d":
                        Auction = Auction.OrderByDescending(A => A.StartTime);
                        break;
                    default:
                        Auction = Auction.OrderByDescending(A => A.StartTime);
                        break;
                }
            }

            List<Auction?> result = await Auction.ToListAsync();

            return result.Any() ? result : null;
        }

        public async Task<List<Auction>> GetByBuyerID(int BuyerID)
        {
            return await dbcontext.Auctions.Where(A => A.PropertyBids.Any(P => P.BuyerId == BuyerID)).ToListAsync();
        }
    }
}
