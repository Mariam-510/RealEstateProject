using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RealEstate.Models.Domains;

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


        //----------------------------------------------------------------------------------------------------
        public static void SeedCategories(ModelBuilder modelBuilder)
        {
            var categories = new List<Category>
            {
                new Category { Id = 1, Name = "Sofas", ImageUrl = "CategoryImages/1.jpg", IsDeleted = false },
                new Category { Id = 2, Name = "Beds", ImageUrl = "CategoryImages/2.jpg", IsDeleted = false },
                new Category { Id = 3, Name = "Dining Sets", ImageUrl = "CategoryImages/3.jpg", IsDeleted = false },
                new Category { Id = 4, Name = "Chairs", ImageUrl = "CategoryImages/4.jpg", IsDeleted = false },
                new Category { Id = 5, Name = "Tables", ImageUrl = "CategoryImages/5.jpg", IsDeleted = false },
                new Category { Id = 6, Name = "Wardrobe", ImageUrl = "CategoryImages/6.jpg", IsDeleted = false },
                new Category { Id = 7, Name = "TV Units", ImageUrl = "CategoryImages/7.jpg", IsDeleted = false }
            };

            modelBuilder.Entity<Category>().HasData(categories);
        }

        //----------------------------------------------------------------------------------------------------
        public static void SeedProducts(ModelBuilder modelBuilder)
        {
            // Sofas
            modelBuilder.Entity<Product>().HasData(new Product[]
            {
        new Product { Id = 1, Name = "Luxurious Leather Sofa", Description = "This luxurious leather sofa is designed for ultimate comfort and style, featuring premium quality leather and durable stitching. Ideal for any living room that needs both comfort and elegance.", Price = 3500, IsUsed = false, CategoryID = 1, Images = new List<string> { "ProductImages/sofa1.jpg", "ProductImages/sofa1_1.jpg", "ProductImages/sofa1_2.jpg", "ProductImages/sofa1_3.jpg" }, DateAdded = new DateTime(2023, 1, 15), AverageRating = 4.2 },
        new Product { Id = 2, Name = "Velvet Sofa Set", Description = "A plush velvet sofa set that brings sophistication to your living room. Soft to the touch with deep cushioning, perfect for relaxation and lounging.", Price = 2800, IsUsed = false, CategoryID = 1, Images = new List<string> { "ProductImages/sofa2.jpg", "ProductImages/sofa2_1.jpg", "ProductImages/sofa2_2.jpg" }, DateAdded = new DateTime(2023, 2, 20), AverageRating = 4.7 },
        new Product { Id = 3, Name = "Reclining Sectional Sofa", Description = "Featuring reclining sections, this sofa is perfect for those who enjoy ultimate comfort while watching TV or reading. Its adjustable backrest ensures personalized relaxation.", Price = 4500, IsUsed = false, CategoryID = 1, Images = new List<string> { "ProductImages/sofa3.jpg", "ProductImages/sofa3_1.jpg", "ProductImages/sofa3_2.jpg", "ProductImages/sofa3_3.jpg", "ProductImages/sofa3_4.jpg" }, DateAdded = new DateTime(2023, 3, 10), AverageRating = 4.9 },
        new Product { Id = 4, Name = "Vintage Chesterfield Sofa", Description = "The timeless Chesterfield sofa offers an old-world charm with its iconic button-tufted back and rolled arms. Ideal for those who appreciate classic design.", Price = 3000, IsUsed = true, CategoryID = 1, Images = new List<string> { "ProductImages/sofa4.jpg", "ProductImages/sofa4_1.jpg", "ProductImages/sofa4_2.jpg" }, DateAdded = new DateTime(2023, 4, 5), AverageRating = 3.8 },
        new Product { Id = 5, Name = "Modern Minimalist Sofa", Description = "A sleek and modern minimalist sofa perfect for contemporary living spaces. The design combines simplicity and elegance with a spacious seat for maximum comfort.", Price = 2500, IsUsed = false, CategoryID = 1, Images = new List<string> { "ProductImages/sofa5.jpg", "ProductImages/sofa5_1.jpg", "ProductImages/sofa5_2.jpg" }, DateAdded = new DateTime(2023, 5, 12), AverageRating = 4.5 }
            });

            // Beds
            modelBuilder.Entity<Product>().HasData(new Product[]
            {
        new Product { Id = 6, Name = "King-Size Wooden Bed", Description = "A beautiful king-size bed crafted from high-quality wood with intricate detailing. Offers a spacious sleeping area and sturdy frame for long-term use.", Price = 4000, IsUsed = false, CategoryID = 2, Images = new List<string> { "ProductImages/bed1.jpg", "ProductImages/bed1_1.jpg", "ProductImages/bed1_2.jpg" }, DateAdded = new DateTime(2023, 1, 25), AverageRating = 4.6 },
        new Product { Id = 7, Name = "Modern Metal Bed Frame", Description = "This modern metal bed frame features clean lines and a minimalist design. Durable and long-lasting, it is ideal for modern bedrooms that need a chic touch.", Price = 2500, IsUsed = true, CategoryID = 2, Images = new List<string> { "ProductImages/bed2.jpg", "ProductImages/bed2_1.jpg"}, DateAdded = new DateTime(2023, 2, 18), AverageRating = 3.9 },
        new Product { Id = 8, Name = "Elegant Queen-Size Bed", Description = "A queen-size bed with an elegant upholstered headboard, soft fabric that adds comfort and luxury to your sleep space.", Price = 3200, IsUsed = false, CategoryID = 2, Images = new List<string> { "ProductImages/bed3.jpg", "ProductImages/bed3_1.jpg" }, DateAdded = new DateTime(2023, 3, 8), AverageRating = 4.8 },
        new Product { Id = 9, Name = "Bunk Bed Set", Description = "A sturdy bunk bed designed for children's rooms. It's space-saving, practical, and comes with safety rails to ensure comfort and security for little ones.", Price = 2200, IsUsed = false, CategoryID = 2, Images = new List<string> { "ProductImages/bed4.jpg", "ProductImages/bed4_1.jpg","ProductImages/bed4_2.jpg" }, DateAdded = new DateTime(2023, 4, 15), AverageRating = 4.3 },
        new Product { Id = 10, Name = "Storage Bed with Drawers", Description = "A functional bed with built-in storage drawers beneath the frame. Perfect for those who need extra storage in their bedroom without compromising on style.", Price = 2700, IsUsed = true, CategoryID = 2, Images = new List<string> { "ProductImages/bed5.jpg", "ProductImages/bed5_1.jpg", "ProductImages/bed5_3.jpg" }, DateAdded = new DateTime(2023, 5, 20), AverageRating = 4.1 }
            });

            // Dining Sets
            modelBuilder.Entity<Product>().HasData(new Product[]
            {
        new Product { Id = 11, Name = "6-Piece Wooden Dining Set", Description = "A 6-piece dining set made from premium solid wood, featuring a long dining table with comfortable chairs that make family meals a breeze.", Price = 5000, IsUsed = false, CategoryID = 3, Images = new List<string> { "ProductImages/dining1.jpg", "ProductImages/dining1_1.jpg","ProductImages/dining1_2.jpg", "ProductImages/dining1_3.jpg" }, DateAdded = new DateTime(2023, 1, 10), AverageRating = 4.9 },
        new Product { Id = 12, Name = "Glass Top Dining Table Set", Description = "This elegant dining set features a sleek glass top dining table with metal legs and matching chairs. It's perfect for modern homes and adds a touch of sophistication to your dining area.", Price = 3500, IsUsed = false, CategoryID = 3, Images = new List<string> { "ProductImages/dining2.jpg", "ProductImages/dining2_1.jpg"}, DateAdded = new DateTime(2023, 2, 12), AverageRating = 4.5 },
        new Product { Id = 13, Name = "Marble Dining Table", Description = "A luxurious marble dining table set with ornate wooden chairs. This set adds a high-end touch to any dining room, perfect for formal gatherings.", Price = 8000, IsUsed = true, CategoryID = 3, Images = new List<string> { "ProductImages/dining3.jpg", "ProductImages/dining3_1.jpg" , "ProductImages/dining3_2.jpg" }, DateAdded = new DateTime(2023, 3, 5), AverageRating = 4.7 },
        new Product { Id = 14, Name = "Compact 4-Piece Dining Set", Description = "A compact 4-piece dining set, ideal for small apartments or kitchens. The set features a sleek, minimalist design with a durable wooden table and chairs.", Price = 1800, IsUsed = false, CategoryID = 3, Images = new List<string> { "ProductImages/dining4.jpg", "ProductImages/dining4_1.jpg", "ProductImages/dining4_2.jpg"}, DateAdded = new DateTime(2023, 4, 18), AverageRating = 3.7 },
        new Product { Id = 15, Name = "Rustic Wooden Dining Set", Description = "This rustic dining set is made of reclaimed wood, perfect for farmhouse-style homes. The set includes a large dining table and 6 matching chairs.", Price = 4200, IsUsed = true, CategoryID = 3, Images = new List<string> { "ProductImages/dining5.jpg", "ProductImages/dining5_1.jpg" }, DateAdded = new DateTime(2023, 5, 22), AverageRating = 4.4 }
            });

            // Chairs
            modelBuilder.Entity<Product>().HasData(new Product[]
            {
        new Product { Id = 16, Name = "Recliner Chair", Description = "This luxurious recliner chair is perfect for relaxing after a long day. With soft fabric and a reclining function, it's perfect for any living room or home theater.", Price = 2300, IsUsed = false, CategoryID = 4, Images = new List<string> { "ProductImages/chair1.jpg", "ProductImages/chair1_1.jpg"}, DateAdded = new DateTime(2023, 1, 8), AverageRating = 4.3 },
        new Product { Id = 17, Name = "Ergonomic Office Chair", Description = "Designed for comfort and support, this ergonomic office chair helps maintain good posture throughout long working hours. Fully adjustable to fit your needs.", Price = 1800, IsUsed = false, CategoryID = 4, Images = new List<string> { "ProductImages/chair2.jpg", "ProductImages/chair2_1.jpg","ProductImages/chair2_2.jpg" }, DateAdded = new DateTime(2023, 2, 14), AverageRating = 4.6 },
        new Product { Id = 18, Name = "Dining Chair Set", Description = "This dining chair set is designed to complement any modern dining table. With cushioned seats and sturdy wooden legs, it provides both comfort and style.", Price = 1200, IsUsed = true, CategoryID = 4, Images = new List<string> { "ProductImages/chair3.jpg", "ProductImages/chair3_1.jpg", "ProductImages/chair3_2.jpg"}, DateAdded = new DateTime(2023, 3, 22), AverageRating = 3.9 },
        new Product { Id = 19, Name = "Modern Lounge Chair", Description = "A stylish lounge chair with a sleek modern design, perfect for your living room or study area. It features plush cushioning and an easy-to-clean fabric.", Price = 1500, IsUsed = false, CategoryID = 4, Images = new List<string> { "ProductImages/chair4.jpg", "ProductImages/chair4_1.jpg" }, DateAdded = new DateTime(2023, 4, 10), AverageRating = 4.8 },
        new Product { Id = 20, Name = "Folding Chair Set", Description = "These practical folding chairs are perfect for hosting guests or outdoor events. Easy to store and highly durable, they are ideal for both indoor and outdoor use.", Price = 600, IsUsed = true, CategoryID = 4, Images = new List<string> { "ProductImages/chair5.jpg", "ProductImages/chair5_1.jpg"}, DateAdded = new DateTime(2023, 5, 5), AverageRating = 3.5 }
            });

            // Tables
            modelBuilder.Entity<Product>().HasData(new Product[]
            {
        new Product { Id = 21, Name = "Wooden Dining Table", Description = "This solid wooden dining table is perfect for family gatherings. With a smooth finish and sturdy build, it can comfortably seat six people.", Price = 3500, IsUsed = false, CategoryID = 5, Images = new List<string> { "ProductImages/table1.jpg", "ProductImages/table1_1.jpg" }, DateAdded = new DateTime(2023, 1, 20), AverageRating = 4.7 },
        new Product { Id = 22, Name = "Marble Coffee Table", Description = "A luxurious marble coffee table with a gold frame. This elegant piece will enhance the decor of any living room or lounge area.", Price = 2500, IsUsed = false, CategoryID = 5, Images = new List<string> { "ProductImages/table2.jpg", "ProductImages/table2_1.jpg"}, DateAdded = new DateTime(2023, 2, 5), AverageRating = 4.5 },
        new Product { Id = 23, Name = "Glass Dining Table", Description = "This sleek glass dining table with a chrome base offers a modern look. Its minimalist design is ideal for contemporary dining rooms.", Price = 4200, IsUsed = false, CategoryID = 5, Images = new List<string> { "ProductImages/table3.jpg", "ProductImages/table3_1.jpg","ProductImages/table3_2.jpg" }, DateAdded = new DateTime(2023, 3, 15), AverageRating = 4.9 },
        new Product { Id = 24, Name = "Round Wooden Table", Description = "This round wooden table offers a cozy and intimate setting for meals or casual gatherings. The compact size makes it perfect for smaller spaces.", Price = 1800, IsUsed = false, CategoryID = 5, Images = new List<string> { "ProductImages/table4.jpg", "ProductImages/table4_1.jpg" }, DateAdded = new DateTime(2023, 4, 8), AverageRating = 4.2 },
        new Product { Id = 25, Name = "Extendable Dining Table", Description = "This extendable dining table offers flexibility for larger gatherings. It can be adjusted from a small table to a larger one with ease.", Price = 5500, IsUsed = true, CategoryID = 5, Images = new List<string> { "ProductImages/table5.jpg", "ProductImages/table5_1.jpg"}, DateAdded = new DateTime(2023, 5, 25), AverageRating = 4.6 }
            });

            // Wardrobe
            modelBuilder.Entity<Product>().HasData(new Product[]
            {
        new Product { Id = 26, Name = "Wooden Wardrobe", Description = "This spacious wooden wardrobe is designed with multiple shelves and hanging spaces to organize your clothes. Its natural wood finish adds warmth to any bedroom.", Price = 5000, IsUsed = false, CategoryID = 6, Images = new List<string> { "ProductImages/wardrobe1.jpg", "ProductImages/wardrobe1_1.jpg" }, DateAdded = new DateTime(2023, 1, 5), AverageRating = 4.8 },
        new Product { Id = 27, Name = "Sliding Door Wardrobe", Description = "This wardrobe features sleek sliding doors and a contemporary design. It provides ample storage while fitting perfectly into modern bedrooms.", Price = 4500, IsUsed = true, CategoryID = 6, Images = new List<string> { "ProductImages/wardrobe2.jpg", "ProductImages/wardrobe2_1.jpg"}, DateAdded = new DateTime(2023, 2, 8), AverageRating = 4.4 },
        new Product { Id = 28, Name = "Mirrored Wardrobe", Description = "A stylish wardrobe with a full-length mirror on the doors. This wardrobe is perfect for storing clothes while also providing a functional mirror for dressing.", Price = 3800, IsUsed = false, CategoryID = 6, Images = new List<string> { "ProductImages/wardrobe3.jpg", "ProductImages/wardrobe3_1.jpg"}, DateAdded = new DateTime(2023, 3, 12), AverageRating = 4.6 },
            });

            // TV Units
            modelBuilder.Entity<Product>().HasData(new Product[]
            {
        new Product { Id = 29, Name = "Wooden TV Unit", Description = "A stylish wooden TV unit that offers storage for media devices and decorative items. Its clean design complements both traditional and contemporary living rooms.", Price = 3000, IsUsed = false, CategoryID = 7, Images = new List<string> { "ProductImages/tvunit1.jpg"}, DateAdded = new DateTime(2023, 1, 18), AverageRating = 4.5 },
        new Product { Id = 30, Name = "Modern TV Stand", Description = "A sleek TV stand with a minimalist design, featuring two spacious shelves for media devices. Ideal for contemporary living spaces.", Price = 2000, IsUsed = false, CategoryID = 7, Images = new List<string> { "ProductImages/tvunit2.jpg", "ProductImages/tvunit2_1.jpg" }, DateAdded = new DateTime(2023, 2, 25), AverageRating = 4.7 },
            });
        }

        //----------------------------------------------------------------------------------------------------
        public static void SeedProductStocks(ModelBuilder modelBuilder)
        {
            var random = new Random();
            var colors = new[] { "Black", "White", "Brown", "Gray", "Beige", "Blue", "Red", "Green", "Yellow" };
            var stockId = 1;

            // Function to generate stock items for a product
            void AddStockForProduct(int productId)
            {
                var stockCount = random.Next(2, 6); // 2-5 variants
                var usedColors = new HashSet<string>();

                for (int i = 0; i < stockCount; i++)
                {
                    // Ensure unique colors for each product variant
                    string color;
                    do
                    {
                        color = colors[random.Next(colors.Length)];
                    } while (usedColors.Contains(color));
                    usedColors.Add(color);

                    modelBuilder.Entity<ProductStock>().HasData(
                        new ProductStock
                        {
                            Id = stockId++,
                            Color = color,
                            Quantity = random.Next(5, 51), // 5-50 in stock
                            IsDeleted = false,
                            ProductId = productId
                        }
                    );
                }
            }

            // Seed stock for all 40 products
            for (int productId = 1; productId <= 30; productId++)
            {
                AddStockForProduct(productId);
            }
        }



    }
}
