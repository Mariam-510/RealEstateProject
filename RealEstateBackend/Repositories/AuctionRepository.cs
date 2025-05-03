using System.ComponentModel;
using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Repositories
{
    public class AuctionRepository : IAuctionRepository
    {
        public RealEstateDbContext dbcontext { get; }
        public AuctionRepository(RealEstateDbContext context)
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
            return await dbcontext.Auctions
                .Include(A=>A.Agent)
                .Include(A=>A.Seller)
                .Where(a =>
                    a.Id == id &&
                    !a.IsDeleted &&
                    ((a.AgentId == null) || !a.Agent.IsDeleted) &&
                    ((a.SellerId == null) || !a.Seller.IsDeleted)
                )
                .FirstOrDefaultAsync();
        }
        
        public async Task<Auction?> GetByPropertyIdAsync(int id)
        {
            return await dbcontext.Auctions.Where(A => A.PropertyId == id && A.IsDeleted == false).FirstOrDefaultAsync();
        }

        public async Task<List<Auction>> GetByUserID(int? AgentID = null, int? SellerID = null)
        {
            var query = dbcontext.Auctions.AsQueryable();

            if (AgentID.HasValue)
                query = query.Include(A => A.Agent).Where(a => a.AgentId == AgentID && a.Agent.IsDeleted==false);

            if (SellerID.HasValue)
                query = query.Include(A => A.Seller).Where(a => a.SellerId == SellerID && a.Seller.IsDeleted == false);

            query = query.Where(a => a.IsDeleted == false);

            return await query.ToListAsync();
        }

        public async Task<List<Auction>> GetAllAsync(string? sortByPrice = null, string? sortByTime = null, Status? ISLivestatus = null)
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

            List<Auction> result = await Auction.ToListAsync();

            return result;
        }

        public async Task<List<Auction>> GetByBuyerID(int BuyerID)
        {
            return await dbcontext.Auctions.Where(A => A.PropertyBids.Any(P => P.BuyerId == BuyerID)).ToListAsync();
        }

        public async Task<(Property? Property, int MaxBid)> GetHighestBidForEndedAuctionsBySellerAsync(int sellerId)
        {
            var currentTime = DateTime.Now.AddHours(1);

            var result = await dbcontext.Auctions
                .Where(a => a.Property != null &&
                           a.Property.SellerId == sellerId &&
                           (a.EndTime <= currentTime || a.Status == Status.Finished))
                .Include(a => a.Property)
                .SelectMany(a => a.PropertyBids)
                .OrderByDescending(b => b.BidAmount)
                .Select(b => new {
                    Bid = b.BidAmount,
                    Property = b.Auction.Property
                })
                .FirstOrDefaultAsync();

            return result != null
                ? (result.Property, (int)result.Bid)
                : (null, 0);
        }

        public async Task<(Property? Property, int MaxBid)> GetHighestBidForEndedAuctionsByAgentAsync(int agentId)
        {
            var currentTime = DateTime.Now.AddHours(1);

            var result = await dbcontext.Auctions
                .Where(a => a.Property != null &&
                           a.Property.AgentId == agentId &&
                           (a.EndTime <= currentTime || a.Status == Status.Finished))
                .Include(a => a.Property)
                .SelectMany(a => a.PropertyBids)
                .OrderByDescending(b => b.BidAmount)
                .Select(b => new {
                    Bid = b.BidAmount,
                    Property = b.Auction.Property
                })
                .FirstOrDefaultAsync();

            return result != null
                ? (result.Property, (int)result.Bid)
                : (null, 0);
        }


        //------------------------------------------------------------------------------------------------------
        public async Task<Auction?> CheckAndUpdateStatus(int auctionId)
        {
            var auction = await dbcontext.Auctions
                .Where(a => a.Id == auctionId && !a.IsDeleted)
                .FirstOrDefaultAsync();

            if (auction == null) return null;

            var now = DateTime.Now.AddHours(1);

            if (now.AddSeconds(30) >= auction.EndTime)
            {
                auction.Status = Status.Finished;
            }
            else if (now.AddSeconds(30) >= auction.StartTime)
            {
                auction.Status = Status.Active;
            }
            else
            {
                auction.Status = Status.Scheduled;
            }

            return auction;
        }

        public async Task<List<Auction>> CheckAndUpdateAllAuctionsStatus()
        {
            var now = DateTime.Now.AddHours(1);

            var auctions = await dbcontext.Auctions
                .Where(a => !a.IsDeleted)
                .ToListAsync();

            foreach (var auction in auctions)
            {
                //var originalStatus = auction.Status;

                // Pure time-based status determination
                if (now.AddSeconds(30) >= auction.EndTime)
                {
                    auction.Status = Status.Finished;
                }
                else if (now.AddSeconds(30) >= auction.StartTime)
                {
                    auction.Status = Status.Active;
                }
                else
                {
                    auction.Status = Status.Scheduled;
                }
            }
            await dbcontext.SaveChangesAsync();

            return auctions;
        }


    }

}
