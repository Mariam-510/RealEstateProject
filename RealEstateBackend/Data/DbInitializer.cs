using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;

namespace RealEstate.Data
{
    public static class DbInitializer
    {
        //----------------------------------------------------------------------------------------------------
        //Seed Roles
        static string AdminRoleId = "98fe3e29-261a-4305-98ae-b6264c17544a";
        static string BuyerRoleId = "972cc7dd-32dd-4ece-aaeb-913bc904655d";
        static string SellerRoleId = "ec29f992-0161-4899-89dd-2314fce2a454";
        static string AgentRoleId = "0985f200-cc19-4e5e-84ef-c498c795ed65";
        public static void SeedRoles(ModelBuilder modelBuilder)
        {
            var roles = new List<IdentityRole>
            {
                new IdentityRole
                {
                    Id=AdminRoleId,
                    ConcurrencyStamp=AdminRoleId,
                    Name="Admin",
                    NormalizedName="Admin".ToUpper(),
                },
                new IdentityRole
                {
                    Id=BuyerRoleId,
                    ConcurrencyStamp=BuyerRoleId,
                    Name="Buyer",
                    NormalizedName="Buyer".ToUpper(),
                },
                new IdentityRole
                {
                    Id=SellerRoleId,
                    ConcurrencyStamp=SellerRoleId,
                    Name="Seller",
                    NormalizedName="Seller".ToUpper(),
                },
                new IdentityRole
                {
                    Id=AgentRoleId,
                    ConcurrencyStamp=AgentRoleId,
                    Name="Agent",
                    NormalizedName="Agent".ToUpper(),
                }
            };
            modelBuilder.Entity<IdentityRole>().HasData(roles);
        }
    }
}
