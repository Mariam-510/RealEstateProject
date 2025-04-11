using Microsoft.EntityFrameworkCore;
using RealEstate.Data;
using RealEstate.Models.Domains;

namespace RealEstate.Services
{
    public class AuctionStatusUpdater : BackgroundService
    {
        private readonly IServiceScopeFactory _scopeFactory;

        public AuctionStatusUpdater(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
        }

        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            while (!stoppingToken.IsCancellationRequested)
            {
                using var scope = _scopeFactory.CreateScope();
                var context = scope.ServiceProvider.GetRequiredService<RealEstateDbContext>();
                TimeZoneInfo egyptTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
                DateTime now = TimeZoneInfo.ConvertTimeFromUtc(DateTime.UtcNow, egyptTimeZone);
                Console.WriteLine(now.ToString());
                var auctions = await context.Auctions
                    .Where(a => !a.IsDeleted)
                    .ToListAsync();

                foreach (var auction in auctions)
                {
                    //Console.WriteLine(auction.Id);
                    //Console.WriteLine(auction.StartTime);
                    //Console.WriteLine(auction.EndTime);
                    //Console.WriteLine("-----------------------");
                    Status newStatus = now < auction.StartTime
                        ? Status.Scheduled
                        : (now <= auction.EndTime ? Status.Active : Status.Finished);

                    if (auction.Status != newStatus)
                        auction.Status = newStatus;
                }

                await context.SaveChangesAsync();
                await Task.Delay(TimeSpan.FromMinutes(1), stoppingToken); // runs every minute
            }
        }
    }
}
