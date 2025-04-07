using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using RealEstate.Models.Domains;

namespace RealEstate.Data
{
    public class AppDbContext : IdentityDbContext<Account>
    {
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
