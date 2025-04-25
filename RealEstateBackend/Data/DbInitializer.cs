using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using RealEstate.Models.Domains;

namespace RealEstate.Data
{
    public static class DbInitializer
    {
        //----------------------------------------------------------------------------------------------------
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
        new Product { Id = 28, Name = "Mirrored Wardrobe", Description = "A stylish wardrobe with a full-length mirror on the doors. This wardrobe is perfect for storing clothes while also providing a functional mirror for dressing.", Price = 3800, IsUsed = false, CategoryID = 6, Images = new List<string> { "ProductImages/wardrobe3.jpg", "ProductImages/wardrobe3_1.jpg"}, DateAdded = new DateTime(2023, 3, 12), AverageRating = 4.6 }
            });

            // TV Units
            modelBuilder.Entity<Product>().HasData(new Product[]
            {
        new Product { Id = 29, Name = "Wooden TV Unit", Description = "A stylish wooden TV unit that offers storage for media devices and decorative items. Its clean design complements both traditional and contemporary living rooms.", Price = 3000, IsUsed = false, CategoryID = 7, Images = new List<string> { "ProductImages/tvunit1.jpg", "ProductImages/tvunit1_1.jpg"}, DateAdded = new DateTime(2023, 1, 18), AverageRating = 4.5 },
        new Product { Id = 30, Name = "Modern TV Stand", Description = "A sleek TV stand with a minimalist design, featuring two spacious shelves for media devices. Ideal for contemporary living spaces.", Price = 2000, IsUsed = false, CategoryID = 7, Images = new List<string> { "ProductImages/tvunit2.jpg", "ProductImages/tvunit2_1.jpg" }, DateAdded = new DateTime(2023, 2, 25), AverageRating = 4.7 }
            });
        }

        //----------------------------------------------------------------------------------------------------
        public static void SeedProductStocks(ModelBuilder modelBuilder)
        {
            var random = new Random(123); // Fixed seed for deterministic output
            var colors = new[]
            {
        "#000000", "#FFFFFF", "#A52A2A", "#808080",
        "#F5F5DC", "#0000FF", "#FF0000", "#008000", "#FFFF00"
    };
            var stockId = 1;

            void AddStockForProduct(int productId)
            {
                var stockCount = random.Next(2, 6); // 2-5 variants per product
                var usedColors = new HashSet<string>();

                for (int i = 0; i < stockCount; i++)
                {
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
                            Color = color, // Now stores hex codes
                            Quantity = random.Next(5, 51),
                            IsDeleted = false,
                            ProductId = productId
                        }
                    );
                }
            }

            // Seed for products 1-30 (adjust range if needed)
            for (int productId = 1; productId <= 30; productId++)
            {
                AddStockForProduct(productId);
            }
        }

        //----------------------------------------------------------------------------------------------------
        public static void SeedProperties(ModelBuilder modelBuilder)
        {
            modelBuilder.Entity<Property>().HasData(
                // Property 1
                new Property
                {
                    Id = 1,
                    Title = "Downtown Luxury Apartment",
                    Description = "This exquisite modern 2-bedroom apartment offers breathtaking panoramic views of the city skyline from its floor-to-ceiling windows. The open-concept living space features high-end finishes including hardwood flooring, custom cabinetry, and premium stainless steel appliances. The master suite boasts a spacious walk-in closet and a spa-like ensuite with heated floors and a rainfall shower. The building amenities include a 24-hour concierge, state-of-the-art fitness center, rooftop terrace with infinity pool, and private dining rooms for entertaining. Located in the heart of the financial district, you're steps away from fine dining, luxury shopping, and cultural attractions. The apartment comes with two underground parking spots and a storage locker. Perfect for professionals seeking a sophisticated urban lifestyle with all the conveniences at your doorstep.",
                    Location = "El-Korba, Heliopolis, Cairo",
                    Type = PropertyType.Sell,
                    Price = 750000.00m,
                    Status = PropertyStatus.Available,
                    PropertyCategory = PropertyCategory.Apartment,
                    BedRooms = 2,
                    BathRooms = 2,
                    Space = 110.00m,
                    AgentId = 1,
                    SellerId = 1,
                    Images = new List<string> { "PropertyImages/1-1.jpg", "PropertyImages/1-2.jpg","PropertyImages/1-3.jpg" },
                    ApprovalStatus = PropertyApprovalStatus.Approved,
                    AddedDate = new DateTime(2025, 1, 15), // Static date

                },

                // Property 2
                new Property
                {
                    Id = 2,
                    Title = "Suburban Family Home",
                    Description = "This charming 4-bedroom family home in the sought-after Green Valley neighborhood offers the perfect blend of comfort and functionality. The recently renovated kitchen features quartz countertops, custom shaker-style cabinets, and professional-grade appliances. The spacious backyard includes a large deck, professionally landscaped gardens, and a play area - ideal for family gatherings and summer barbecues. Inside, you'll find hardwood floors throughout, a cozy fireplace in the living room, and a finished basement that can serve as a recreation room or home office. The primary bedroom includes an ensuite bathroom with double vanity and walk-in closet. Located in a top-rated school district with easy access to parks, community centers, and shopping. The neighborhood is known for its friendly atmosphere and annual community events. A true family sanctuary just minutes from all amenities.",
                    Location = "El Rehab City, New Cairo",
                    Type = PropertyType.Rent,
                    Price = 3200.00m,
                    Status = PropertyStatus.Available,
                    PropertyCategory = PropertyCategory.House,
                    BedRooms = 4,
                    BathRooms = 3,
                    Space = 240.00m,
                    AgentId = 2,
                    SellerId = 2,
                    Images = new List<string> { "PropertyImages/2-1.jpg", "PropertyImages/2-2.jpg", "PropertyImages/2-3.jpg",
                    "PropertyImages/2-4.jpg","PropertyImages/2-5.jpg"},
                    ApprovalStatus = PropertyApprovalStatus.Pending,
                    AddedDate = new DateTime(2025, 2, 15), // Static date

                },

                // Property 3 (Villa)
                new Property
                {
                    Id = 3,
                    Title = "Luxury Beachfront Villa",
                    Description = "Experience ultimate luxury in this stunning beachfront villa that offers direct private access to pristine white sand beaches. This architectural masterpiece spans nearly 500 square meters of living space with floor-to-ceiling windows that showcase breathtaking ocean views from every room. The gourmet kitchen is equipped with top-of-the-line appliances, custom cabinetry, and a massive center island. The villa features five ensuite bedrooms, each with its own unique design theme and private balcony. The infinity pool seems to merge with the ocean horizon, surrounded by an expansive sun deck with lounge areas and an outdoor kitchen. Smart home technology controls lighting, temperature, security and entertainment systems throughout the property. The landscaped grounds include tropical gardens, a meditation pavilion, and a private dock. Located in an exclusive gated community with 24/7 security, this is coastal living at its most luxurious and private.",
                    Location = "Marina El Alamein, North Coast",
                    Type = PropertyType.Sell,
                    Price = 2500000.00m,
                    Status = PropertyStatus.Sold,
                    PropertyCategory = PropertyCategory.Villa,
                    BedRooms = 5,
                    BathRooms = 5,
                    Space = 480.00m,
                    AgentId = 1,
                    SellerId = 3,
                    Images = new List<string> { "PropertyImages/3-1.jpg", "PropertyImages/3-2.jpg", "PropertyImages/3-3.jpg" },
                    ApprovalStatus = PropertyApprovalStatus.Approved,
                    AddedDate = new DateTime(2025, 3, 3), // Static date

                },

                // Property 4 (Studio)
                new Property
                {
                    Id = 4,
                    Title = "City Center Studio",
                    Description = "This beautifully designed studio apartment offers an exceptional urban living experience in the most vibrant part of downtown. Despite its compact size, the space has been meticulously planned to maximize functionality with custom built-in storage solutions, a Murphy bed that transforms into a workspace, and a kitchenette with full-size appliances cleverly integrated into the design. The unit features polished concrete floors, exposed brick walls, and large industrial-style windows that flood the space with natural light. The building offers fantastic amenities including a shared rooftop terrace with skyline views, co-working spaces, laundry facilities, and a bike storage room. Located in the trendiest neighborhood with countless cafes, restaurants, and nightlife options right outside your door. Perfect for young professionals or students who want to live in the heart of the action without compromising on style and comfort. Includes all utilities and high-speed internet in the rent.",
                    Location = "Zamalek, Cairo",
                    Type = PropertyType.Rent,
                    Price = 1200.00m,
                    Status = PropertyStatus.Available,
                    PropertyCategory = PropertyCategory.Studio,
                    BedRooms = 1,
                    BathRooms = 1,
                    Space = 45.00m,
                    AgentId = 3,
                    SellerId = 4,
                    Images = new List<string> { "PropertyImages/4-1.jpg",
                        "PropertyImages/4-2.jpg", 
                        "PropertyImages/4-3.jpg",
                        "PropertyImages/4-4.jpg" },
                    ApprovalStatus = PropertyApprovalStatus.Approved,
                    AddedDate = new DateTime(2024, 12, 12), // Static date

                },

                // Property 5 (Penthouse)
                new Property
                {
                    Id = 5,
                    Title = "Skyline Penthouse",
                    Description = "Perched atop the city's most prestigious tower, this extraordinary penthouse redefines luxury living with its unparalleled views, exquisite finishes, and expansive 320 square meter layout. The residence features a grand entrance gallery that leads to a spectacular great room with 360-degree panoramic views through floor-to-ceiling glass walls. The chef's kitchen is outfitted with the finest appliances from Sub-Zero, Wolf, and Miele, complemented by custom Italian cabinetry and rare stone countertops. The primary bedroom suite is a private sanctuary complete with a lavish dressing room and spa bathroom featuring a freestanding soaking tub and steam shower. Additional highlights include a state-of-the-art home theater, temperature-controlled wine cellar, and a private elevator entrance. The crowning jewel is the sprawling rooftop terrace with an outdoor kitchen, infinity-edge jacuzzi, and multiple lounge and dining areas - perfect for entertaining against the backdrop of the glittering city skyline. This is urban living at its most exclusive and sophisticated.",
                    Location = "Nile Corniche, Maadi, Cairo",
                    Type = PropertyType.Sell,
                    Price = 3850000.00m,
                    Status = PropertyStatus.Available,
                    PropertyCategory = PropertyCategory.Penthouse,
                    BedRooms = 3,
                    BathRooms = 3,
                    Space = 320.00m,
                    AgentId = 2,
                    SellerId = 5,
                    Images = new List<string> { "PropertyImages/5-1.jpg", "PropertyImages/5-2.jpg",
                    "PropertyImages/5-3.jpg","PropertyImages/5-4.jpg"},
                    ApprovalStatus = PropertyApprovalStatus.Approved,
                    AddedDate = new DateTime(2025, 1, 17), // Static date

                },

                // Property 6 (Duplex)
                new Property
                {
                    Id = 6,
                    Title = "Modern Duplex Apartment",
                    Description = "This architect-designed duplex apartment offers a unique two-level living experience in the vibrant Tech Park neighborhood. The lower level features an open-concept living area with soaring ceilings, a sleek modern kitchen with waterfall-edge island, and a wall of glass doors that open to a private balcony. A sculptural floating staircase leads to the upper level where you'll find two spacious bedrooms, each with ensuite bathrooms and ample closet space. The interior showcases premium finishes throughout including wide-plank oak flooring, designer lighting fixtures, and smart home technology. The building offers exceptional amenities including a fitness center, co-working lounge, and a rooftop terrace with stunning city views. Located in an up-and-coming area known for its tech startups, trendy cafes, and art galleries. This property appeals to those who appreciate contemporary design and urban convenience, with easy access to public transportation and major highways. A rare opportunity to own a distinctive home in one of the city's most dynamic neighborhoods.",
                    Location = "Smart Village, 6th of October City, Giza",
                    Type = PropertyType.Rent,
                    Price = 4500.00m,
                    Status = PropertyStatus.Available,
                    PropertyCategory = PropertyCategory.Duplex,
                    BedRooms = 2,
                    BathRooms = 2,
                    Space = 180.00m,
                    AgentId = 4,
                    SellerId = 6,
                    Images = new List<string> { "PropertyImages/6-1.jpg", "PropertyImages/6-2.jpg",
                    "PropertyImages/6-3.jpg","PropertyImages/6-4.jpg","PropertyImages/6-5.jpg"},
                    ApprovalStatus = PropertyApprovalStatus.Pending,
                    AddedDate = new DateTime(2025, 4, 8) // Static date

                },

                // Property 7 (Townhouse)
                new Property
                {
                    Id = 7,
                    Title = "Historic Townhouse",
                    Description = "Step into a piece of history with this meticulously restored 19th century townhouse that seamlessly blends period charm with modern comforts. The property retains original features including ornate moldings, hardwood floors, and three original fireplaces, all carefully preserved during the recent renovation. The gourmet kitchen has been completely updated with high-end appliances while maintaining the home's historic character through custom cabinetry that matches the original woodwork. The four bedrooms include a luxurious primary suite with a spa-like bathroom featuring a clawfoot tub and separate shower. The private rear garden is a tranquil oasis with mature plantings, a bluestone patio, and a charming gazebo. Located on one of Old Town's most picturesque streets, this home is just steps from boutique shopping, acclaimed restaurants, and cultural landmarks. The property includes a rare two-car garage and full basement with high ceilings that could be finished for additional living space. A true gem for those who appreciate historic architecture and craftsmanship.",
                    Location = "Garden City, Cairo",
                    Type = PropertyType.Sell,
                    Price = 1250000.00m,
                    Status = PropertyStatus.Available,
                    PropertyCategory = PropertyCategory.Townhouse,
                    BedRooms = 4,
                    BathRooms = 3,
                    Space = 280.00m,
                    AgentId = 5,
                    SellerId = 7,
                    Images = new List<string> { "PropertyImages/7-1.jpg", "PropertyImages/7-2.jpg", "PropertyImages/7-3.jpg" },
                    ApprovalStatus = PropertyApprovalStatus.Approved,
                    AddedDate = new DateTime(2024, 10, 23) // Static date

                },

                // Property 8 (Mansion)
                new Property
                {
                    Id = 8,
                    Title = "Grand Estate Mansion",
                    Description = "This palatial estate sprawls across 10 acres of meticulously landscaped grounds in the exclusive Elite Hills enclave. The 12,000 square foot mansion boasts grand formal rooms perfect for entertaining, including a ballroom with crystal chandeliers, a wood-paneled library, and a formal dining room that seats 20. The chef's kitchen is equipped with commercial-grade appliances and connects to a casual breakfast room with panoramic views of the grounds. The primary suite occupies its own wing with a sitting room, two walk-in closets, and a luxurious bathroom with a soaking tub and steam shower. Additional amenities include a home theater, indoor pool complex with spa, tennis court, and a guest house with three bedrooms. The grounds feature formal gardens, a koi pond, and a winding driveway that creates a grand approach. Security features include gated entry, surveillance cameras, and a full generator system. This is a once-in-a-lifetime opportunity to own one of the area's most prestigious properties, offering unparalleled privacy and luxury just minutes from the city center.",
                    Location = "Katameya Heights, New Cairo",
                    Type = PropertyType.Sell,
                    Price = 8500000.00m,
                    Status = PropertyStatus.Auctioned,
                    PropertyCategory = PropertyCategory.Mansion,
                    BedRooms = 8,
                    BathRooms = 7,
                    Space = 1200.00m,
                    AgentId = 1,
                    SellerId = 8,
                    Images = new List<string> { "PropertyImages/8-1.jpg", "PropertyImages/8-2.jpg", "PropertyImages/8-3.jpg", "PropertyImages/8-4.jpg" },
                    ApprovalStatus = PropertyApprovalStatus.Approved,
                    AddedDate = new DateTime(2024, 11, 27) // Static date

                },

                // Property 9 (Apartment)
                new Property
                {
                    Id = 9,
                    Title = "River View Apartment",
                    Description = "Wake up to stunning river views every morning in this bright and airy 1-bedroom apartment. The open-concept layout maximizes the breathtaking water views, with a wall of windows in the living area that frame the ever-changing scenery. The modern kitchen features quartz countertops, stainless steel appliances, and a breakfast bar perfect for casual dining. The bedroom is generously sized with a large walk-in closet, while the bathroom offers a spa-like experience with a deep soaking tub and separate glass shower. The private balcony is the perfect spot to enjoy morning coffee or evening cocktails while watching boats sail by. Building amenities include a 24-hour concierge, fitness center, and a shared rooftop terrace with barbecue stations. Located in the desirable Waterside neighborhood with easy access to riverside walking trails, charming cafes, and the downtown core. This apartment offers an exceptional quality of life for those who appreciate beautiful views and convenient urban living.",
                    Location = "Nile Towers, Giza Corniche",
                    Type = PropertyType.Rent,
                    Price = 1800.00m,
                    Status = PropertyStatus.Available,
                    PropertyCategory = PropertyCategory.Apartment,
                    BedRooms = 1,
                    BathRooms = 1,
                    Space = 65.00m,
                    AgentId = 3,
                    SellerId = 9,
                    Images = new List<string> { "PropertyImages/9-1.jpg", "PropertyImages/9-2.jpg", "PropertyImages/9-3.jpg", "PropertyImages/9-4.jpg" },
                    ApprovalStatus = PropertyApprovalStatus.Rejected,
                    AddedDate = new DateTime(2025, 4, 20) // Static date

                },

                // Property 10 (House)
                new Property
                {
                    Id = 10,
                    Title = "Fixer-Upper Opportunity",
                    Description = "This solid 3-bedroom home presents an incredible opportunity for investors or handy homeowners looking to create their dream house. While needing significant updates, the property has good bones with a strong foundation, recently replaced roof, and updated electrical system. The spacious layout includes a large living room with fireplace, separate dining area, and a kitchen that could be opened up to create a modern great room. The backyard is surprisingly large for the neighborhood, offering potential for outdoor living space or even an addition. Located in an up-and-coming area that's seeing rapid redevelopment, this property represents excellent value for those willing to put in the work. The neighborhood is transitioning with new cafes, breweries, and boutiques opening regularly. Just a short commute to downtown, this is a prime candidate for a complete renovation or flip. Bring your vision and contractor to explore the possibilities - this could be transformed into a stunning modern home or a lucrative rental property in one of the city's hottest emerging neighborhoods.",
                    Location = "Shorouk City, Cairo",
                    Type = PropertyType.Sell,
                    Price = 220000.00m,
                    Status = PropertyStatus.Available,
                    PropertyCategory = PropertyCategory.House,
                    BedRooms = 3,
                    BathRooms = 2,
                    Space = 150.00m,
                    AgentId = 4,
                    SellerId = 10,
                    Images = new List<string> { "PropertyImages/10-1.jpg", "PropertyImages/10-2.jpg", "PropertyImages/10-3.jpg" },
                    ApprovalStatus = PropertyApprovalStatus.Pending,
                    AddedDate = new DateTime(2025, 3, 8) // Static date

                },

                // Property 11 (Villa)
                new Property
                {
                    Id = 11,
                    Title = "Mountain Retreat Villa",
                    Description = "Escape to your private mountain sanctuary with this stunning villa nestled in the serene High Peaks region. Designed to blend seamlessly with its natural surroundings, the home features expansive windows that frame breathtaking mountain vistas from every room. The great room boasts a massive stone fireplace and vaulted wood-beamed ceilings, creating a warm and inviting atmosphere. The gourmet kitchen is equipped with professional appliances and a large center island, perfect for preparing meals after a day of outdoor adventures. The property includes four ensuite bedrooms, each with private balconies to enjoy the crisp mountain air. Outside, you'll find multiple terraces, a hot tub with panoramic views, and direct access to hiking trails. The lower level features a recreation room with wet bar, home gym, and sauna. Located in a private community with shared amenities including tennis courts and a clubhouse, this is the ultimate retreat for nature lovers who don't want to sacrifice luxury. Just two hours from the city but feels a world away, offering the perfect balance of seclusion and accessibility.",
                    Location = "El Gouna, Red Sea",
                    Type = PropertyType.Rent,
                    Price = 5000.00m,
                    Status = PropertyStatus.Available,
                    PropertyCategory = PropertyCategory.Villa,
                    BedRooms = 4,
                    BathRooms = 3,
                    Space = 300.00m,
                    AgentId = 5,
                    SellerId = 11,
                    Images = new List<string> { "PropertyImages/11-1.jpg", "PropertyImages/11-2.jpg", "PropertyImages/11-3.jpg", "PropertyImages/11-4.jpg" },
                    ApprovalStatus = PropertyApprovalStatus.Approved,
                    AddedDate = new DateTime(2025, 1, 2) // Static date

                },

                // Property 12 (Studio)
                new Property
                {
                    Id = 12,
                    Title = "Artist's Studio Loft",
                    Description = "This unique live-work space in the heart of the Creative District is perfect for artists, writers, or anyone seeking an inspiring urban loft. The open 35-square-meter space features soaring ceilings with exposed ductwork, original brick walls, and enormous north-facing windows that flood the space with perfect natural light. The flexible layout can accommodate various configurations - use the open area as a painting studio, photography space, or simply as an airy living area. A compact but fully functional kitchenette and a stylish bathroom with walk-in shower complete the space. The building has a rich artistic history, having been home to several notable local artists over the decades. Current residents enjoy the building's creative energy and regular open studio events. Located just steps from galleries, performance spaces, and some of the city's most innovative restaurants. This is more than just an apartment - it's a creative haven in the city's most vibrant arts community. Includes access to shared rooftop space with skyline views.",
                    Location = "Downtown Arts District, Alexandria",
                    Type = PropertyType.Rent,
                    Price = 950.00m,
                    Status = PropertyStatus.Available,
                    PropertyCategory = PropertyCategory.Studio,
                    BedRooms = 0,
                    BathRooms = 1,
                    Space = 35.00m,
                    AgentId = 2,
                    SellerId = 12,
                    Images = new List<string> { "PropertyImages/12-1.jpg", "PropertyImages/12-2.jpg" , "PropertyImages/12-3.jpg" },
                    ApprovalStatus = PropertyApprovalStatus.Approved,
                    AddedDate = new DateTime(2025, 1, 7) // Static date

                },

                // Property 13 (Penthouse)
                new Property
                {
                    Id = 13,
                    Title = "Executive Penthouse Suite",
                    Description = "Designed for the discerning business traveler or corporate executive, this fully-furnished penthouse suite offers hotel-like amenities with the comfort of a private residence. The sophisticated interior features a neutral palette with high-end finishes, creating a serene and productive environment. The living area includes a dedicated workspace with high-speed internet and printer, while the bedroom offers blackout curtains and premium bedding for optimal rest. The kitchen is equipped with everything needed for short or extended stays, including a Nespresso machine and wine cooler. Building amenities rival five-star hotels, including 24/7 concierge service, business center, meeting rooms, and a fitness facility with personal training available. The location couldn't be more convenient - just steps from the financial district's major office towers, luxury shopping, and fine dining. Flexible lease terms available, with housekeeping and laundry services optional. This is corporate housing at its most elegant and convenient, perfect for relocation packages or project-based stays in the city.",
                    Location = "City Stars Towers, Nasr City, Cairo",
                    Type = PropertyType.Rent,
                    Price = 8500.00m,
                    Status = PropertyStatus.Available,
                    PropertyCategory = PropertyCategory.Penthouse,
                    BedRooms = 2,
                    BathRooms = 2,
                    Space = 160.00m,
                    AgentId = 1,
                    SellerId = 13,
                    Images = new List<string> { "PropertyImages/13-1.jpg", "PropertyImages/13-2.jpg", "PropertyImages/13-3.jpg" },
                    ApprovalStatus = PropertyApprovalStatus.Approved,
                    AddedDate = new DateTime(2024, 11, 11) // Static date

                },

                // Property 14 (Townhouse)
                new Property
                {
                    Id = 14,
                    Title = "Modern Townhouse Complex",
                    Description = "This newly constructed townhouse in the rapidly developing Growth Zone offers contemporary urban living at its finest. The three-level design maximizes space with an open-concept main floor featuring a chef's kitchen with premium appliances, a spacious living/dining area, and access to a private courtyard. The second floor houses two well-proportioned bedrooms and a luxurious main bathroom, while the top level is entirely dedicated to the primary suite with walk-in closet and spa-like ensuite. High-end finishes throughout include wide-plank engineered hardwood floors, custom cabinetry, and smart home features. The property includes two underground parking spots and additional storage. Located in an emerging neighborhood that's attracting young professionals and families with its mix of new condominiums, parks, and trendy eateries. Excellent public transit access and just minutes from downtown. The complex features beautifully landscaped common areas and a shared rooftop terrace with skyline views. A perfect lock-and-leave option for those who want low-maintenance living without sacrificing style or space.",
                    Location = "Palm Hills, Sheikh Zayed City, Giza",
                    Type = PropertyType.Sell,
                    Price = 620000.00m,
                    Status = PropertyStatus.Sold,
                    PropertyCategory = PropertyCategory.Townhouse,
                    BedRooms = 3,
                    BathRooms = 2,
                    Space = 210.00m,
                    AgentId = 3,
                    SellerId = 14,
                    Images = new List<string> { "PropertyImages/14-1.jpg", "PropertyImages/14-2.jpg" , "PropertyImages/14-3.jpg", "PropertyImages/14-4.jpg" },
                    ApprovalStatus = PropertyApprovalStatus.Approved,
                    AddedDate = new DateTime(2025, 3, 7) // Static date

                },

                // Property 15 (Mansion)
                new Property
                {
                    Id = 15,
                    Title = "Celebrity Estate",
                    Description = "Once owned by a renowned Hollywood actor, this magnificent 25,000 square foot estate offers unparalleled luxury and privacy on 5 acres in the exclusive Private Hills enclave. The palatial residence features grand formal rooms including a double-height entry foyer, a ballroom with capacity for 200 guests, and a screening room with stadium seating. The gourmet kitchen is outfitted with commercial-grade appliances and connects to multiple dining areas including a breakfast room with panoramic views. The primary suite is a true retreat with his-and-hers bathrooms, dressing rooms, and a private lounge. Additional amenities include a 12-car garage, indoor basketball court, bowling alley, and a wellness center with spa, salon, and massage room. The spectacular grounds feature a resort-style pool complex with cabanas, tennis court, putting green, and manicured gardens designed by a celebrated landscape architect. Security features include a gated entrance, perimeter fencing, and state-of-the-art surveillance system. This is a once-in-a-generation opportunity to own one of the most extraordinary private estates in the region, offering complete privacy just minutes from the city.",
                    Location = "Beverly Hills, Sheikh Zayed City, Giza",
                    Type = PropertyType.Sell,
                    Price = 25000000.00m,
                    Status = PropertyStatus.Available,
                    PropertyCategory = PropertyCategory.Mansion,
                    BedRooms = 10,
                    BathRooms = 8,
                    Space = 2500.00m,
                    AgentId = 5,
                    SellerId = 15,
                    Images = new List<string> { "PropertyImages/15-1.jpg", "PropertyImages/15-2.jpg", "PropertyImages/15-3.jpg", "PropertyImages/15-4.jpg" },
                    ApprovalStatus = PropertyApprovalStatus.Pending,
                    AddedDate = new DateTime(2025, 4, 4) // Static date

                }
            );
        }

    }
}
