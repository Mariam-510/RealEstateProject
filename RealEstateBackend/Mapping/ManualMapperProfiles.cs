using RealEstate.Models.Domains;
using RealEstate.Models.DTOs.ConversationDto;
using RealEstate.Models.DTOs.MessageDto;
using RealEstate.Models.DTOs.Auction;
using RealEstate.Models.DTOs.Category;
using RealEstate.Models.DTOs.Product;
using RealEstate.Models.DTOs.Wishlist;
using RealEstate.Models.DTOs.OrderDto;
using RealEstate.Models.DTOs.ReviewDto;
using RealEstate.Models.Dtos.ProductStockDto;

namespace RealEstate.Mapping
{
    public static class ManualMapperProfiles
    {
        //----------------------------------------------------------------------------------------
        // Conversation

        public static ConversationResponseDto ConversationResponseDto(this Conversation conversation)
        {
            return new ConversationResponseDto
            {
                Id = conversation.Id,
                Status = conversation.Status,
                CreatedAt = conversation.CreatedAt,
                LastMessageAt = conversation.LastMessageAt,
                FirstAccountId = conversation.FirstAccountId,
                SecondAccountId = conversation.SecondAccountId
            };
        }

        //----------------------------------------------------------------------------------------
        // Messages

        public static MessageResponseDto MessageResponseDto(this Message message)
        {
            return new MessageResponseDto
            {
                Id = message.Id,
                Content = message.Content,
                SenderId = message.SenderId,
                ConversationId = message.ConversationId,
                Status = message.Status,
                SentAt = message.SentAt
            };
        }

        //----------------------------------------------------------------------------------------
        //Order

        public static OrderResponseDto OrderResponseDto(this Order order)
        {
            return new OrderResponseDto
            {
                Id = order.Id,
                OrderDate = order.OrderDate.ToString(),
                Status = order.Status.ToString(),
                SubTotal = order.SubTotal,
                DeliveryFees = order.DeliveryFees,
                IsDeleted = order.IsDeleted,
                BuyerId = order.BuyerId,
                AddressId = order.AddressId,
                PaymentId = order.PaymentId,
                PaymentMethod = order.Payment?.PaymentMethod.ToString() ?? null,

            };
        }

        //----------------------------------------------------------------------------------------
        //Review

        public static ReviewResponseDto ReviewResponseDto(this Review review)
        {
            return new ReviewResponseDto
            {
                Id = review.Id,
                Rating = review.Rating,
                Comment = review.Comment,
                Date = review.Date.ToString(),
                ProductId = review.ProductId,
                BuyerId = review.BuyerId,
                BuyerFName = review.Buyer.FirstName,
                BuyerLName = review.Buyer.LastName,
                BuyerImageUrl = review.Buyer.Account?.ImageUrl
            };
        }

        //----------------------------------------------------------------------------------------
        // Product
       
        public static ProductDTOShow ToProductDTOShow(this Product product)
        {
            return new ProductDTOShow
            {
                Id = product.Id,
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                IsUsed = product.IsUsed,
                IsDeleted = product.IsDeleted,
                DateAdded = product.DateAdded,
                AverageRating = product.AverageRating,
                CategoryID = product.CategoryID ?? 0,
                CategoryName = product.Category?.Name ?? string.Empty,
                Productimage = product.Images,
                Quantity = product.ProductStocks?.Sum(ps => ps.Quantity) ?? 0,
                ProductStockDtos = product.ProductStocks?
                    .Select(ps => new ProductStockDto
                    {
                        Id = ps.Id,
                        ProductId = ps.ProductId,
                        Color = ps.Color,
                        Quantity = ps.Quantity
                    })
                    .ToList()
            };
        }

        public static List<ProductDTOShow> ToProductDTOShowList(this List<Product> products)
        {
            return products.Select(p=>p.ToProductDTOShow()).ToList();
        }
        
        public static Product ToProductModel(this ProductDTO product)
        {
            return new Product
            {
                Name = product.Name,
                Description = product.Description,
                Price = product.Price,
                IsUsed = product.IsUsed,
                CategoryID = product.CategoryID
            };
        }

        //----------------------------------------------------------------------------------------
        // Category
        
        public static CategoryDTOShow ToCategoryWithoutProductListDTOShow(this Category Category)
        {
            return new CategoryDTOShow
            {
                Id = Category.Id,
                Name = Category.Name,
                Categoryimage = Category.ImageUrl,
            };
        }

        public static Category ToCategoryModel(this CategoryDTO category)
        {
            return new Category
            {

                Name = category.Name,


            };
        }

        public static List<CategoryDTOShow> ToCategoryDTOShowList(this List<Category> Categories)
        {
            return Categories.Select(ToCategoryWithoutProductListDTOShow).ToList();
        }

        //----------------------------------------------------------------------------------------
        // Wishlist
        
        public static Wishlist ToWishListProductModel(this WishListProductDTO wishlistproductDTO)
        {
            return new Wishlist
            {

                ProductId = wishlistproductDTO.ProductId,
            };
        }
        
        public static Wishlist ToWishListPropertyModel(this WishListPropertyDTO wishlistpropertyDTO)
        {
            return new Wishlist
            {

                PropertyId = wishlistpropertyDTO.PropertyID,
            };
        }

        //----------------------------------------------------------------------------------------
        // Auction
        
        public static Auction ToAuctionModel(this AuctionDTO AuctionDto)
        {
            TimeZoneInfo egyptTimeZone = TimeZoneInfo.FindSystemTimeZoneById("Egypt Standard Time");
            return new Auction
            {

                StartTime = TimeZoneInfo.ConvertTime(AuctionDto.StartTime, egyptTimeZone),
                EndTime = TimeZoneInfo.ConvertTime(AuctionDto.EndTime, egyptTimeZone),
                StartPrice = AuctionDto.StartPrice,
                PropertyId= AuctionDto.PropertyId,
                SellerId= AuctionDto.SellerId,
                AgentId= AuctionDto.AgentId,

            };
        }

        public static AuctionDTOShow ToAuctionDTOShow(this Auction auction)
        {
            return new AuctionDTOShow
            {
                Id= auction.Id,
                StartTime = auction.StartTime,
                EndTime = auction.EndTime,
                StartPrice = auction.StartPrice,
                Status = auction.Status,
                PropertyId = auction.PropertyId.Value,
                SellerId = auction.SellerId,
                AgentId = auction.AgentId,

            };
        }

        public static List<AuctionDTOShow> ToAuctionDTOShowList(this List<Auction> Auctions)
        {
            return Auctions.Select(ToAuctionDTOShow).ToList();
        }

        
    }
}
