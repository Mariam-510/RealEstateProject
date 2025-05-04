using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RealEstate.Models.Domains;
using static RealEstate.Data.DbInitializer;
using System.Reflection.Emit;

namespace RealEstate.Data
{
    public class RealEstateDbContext : IdentityDbContext<Account>
    {
        #region DBSETS
        public virtual DbSet<Admin> Admins { get; set; }
        public virtual DbSet<Agent> Agents { get; set; }
        public virtual DbSet<Buyer> Buyers { get; set; }
        public virtual DbSet<Seller> Sellers { get; set; }
        public virtual DbSet<Contract> Contracts { get; set; }
        public virtual DbSet<Order> Orders { get; set; }
        public virtual DbSet<Category> Categories { get; set; }
        public virtual DbSet<OrderItem> OrderItems { get; set; }
        public virtual DbSet<Product> Products { get; set; }
        public virtual DbSet<Wishlist> Wishlists { get; set; }
        public virtual DbSet<Message> Messages { get; set; }
        public virtual DbSet<Conversation> Conversations { get; set; }
        public virtual DbSet<PropertyBid> PropertyBids { get; set; }
        public virtual DbSet<Property> Properties { get; set; }
        public virtual DbSet<Auction> Auctions { get; set; }
        public virtual DbSet<Appointment> Appointments { get; set; }
        public virtual DbSet<Payment> Payments { get; set; }
        public virtual DbSet<Subscription> Subscriptions { get; set; }
        public virtual DbSet<SubscriptionPlan> SubscriptionPlans { get; set; }
        public virtual DbSet<Address> Addresses { get; set; }
        public virtual DbSet<Cart> Carts { get; set; }
        public virtual DbSet<Review> Reviews { get; set; }
        public virtual DbSet<Shipping> Shippings { get; set; }
        public virtual DbSet<ProductStock> ProductStocks { get; set; }
        public virtual DbSet<AuctionBuyer> AuctionBuyers { get; set; }
        #endregion

        public RealEstateDbContext(DbContextOptions<RealEstateDbContext> options)
            : base(options) // Pass options to base class
        {
        }

        protected override void OnModelCreating(ModelBuilder builder)
        {
            base.OnModelCreating(builder);

            builder.Entity<Conversation>()
                .HasOne(c => c.FirstAccount)
                .WithMany(a => a.FirstParticipantConversations)
                .HasForeignKey(c => c.FirstAccountId)
                .OnDelete(DeleteBehavior.Restrict);

            builder.Entity<Conversation>()
                .HasOne(c => c.SecondAccount)
                .WithMany(a => a.SecondParticipantConversations)
                .HasForeignKey(c => c.SecondAccountId)
                .OnDelete(DeleteBehavior.Restrict);

            //----------------------------------------------------------------------------------
            //SeedRoles
            DbInitializer.SeedRoles(builder);

            //----------------------------------------------------------------------------------
            //SeedRoles
            DbInitializer.SeedAdmins(builder);

            //----------------------------------------------------------------------------------
            //SeedRoles
            DbInitializer.SeedSellers(builder);

            //----------------------------------------------------------------------------------
            //SeedRoles
            DbInitializer.SeedAgents(builder);

            //----------------------------------------------------------------------------------
            //SeedCategories
            DbInitializer.SeedCategories(builder);

            //----------------------------------------------------------------------------------
            //SeedProducts
            DbInitializer.SeedProducts(builder);

            //----------------------------------------------------------------------------------
            //SeedProductStocks
            DbInitializer.SeedProductStocks(builder);

            //----------------------------------------------------------------------------------
            //SeedProperties
            DbInitializer.SeedProperties(builder);

            //----------------------------------------------------------------------------------
            //SeedSubscriptionPlans
            DbInitializer.SeedSubscriptionPlans(builder);

            //----------------------------------------------------------------------------------
            //SeedSubscriptionPlans
            DbInitializer.SeedShippings(builder);

            //----------------------------------------------------------------------------------
            DbInitializer.SeedSubscriptions(builder);

            //----------------------------------------------------------------------------------
            DbInitializer.SeedContracts(builder);

        }

    }
}
