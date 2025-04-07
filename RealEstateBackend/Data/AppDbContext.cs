using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RealEstate.Models.Domains;

namespace RealEstate.Data
{
    public class AppDbContext : IdentityDbContext<Account>
    {
        public virtual DbSet<Property> Properties { get; set; }
        public virtual DbSet<Auction> Auctions { get; set; }
        public virtual DbSet<Appointment> Appointments { get; set; }
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
            
        }
       

    }
}
