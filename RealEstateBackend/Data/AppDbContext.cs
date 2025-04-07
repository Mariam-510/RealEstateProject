using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RealEstate.Models.Domains;

namespace RealEstate.Data
{
    public class AppDbContext : IdentityDbContext<Account>
    {
        public virtual DbSet<Admin> Admins { get; set; }
        public virtual DbSet<Agent> Agents { get; set; }
        public virtual DbSet<Buyer> Buyers { get; set; }
        public virtual DbSet<Seller> Sellers { get; set; }
        public virtual DbSet<Contract> Contracts { get; set; }
        public virtual DbSet<Order> Orders {  get; set; }
        public virtual DbSet<Category> Categories { get; set; }
        public virtual DbSet<OrderItem> OrderItems { get; set; }
        public virtual DbSet<Product> Products { get; set; }
        public virtual DbSet<Wishlist> Wishlists { get; set; }
        
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            //----------------------------------------------------------------------------------
            //SeedRoles
            DbInitializer.SeedRoles(builder);

        }
    }
}
