using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using System.Text;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using RealEstate.Models.Domains;
using Microsoft.OpenApi.Models;
using RealEstate.Models.Attributes;
using RealEstate.Repositories;
using RealEstate.Services;
using RealEstate.JWT;
using RealEstate.Models;
using RealEstate.Data;
using RealEstate.Hubs;
using System.Security.Claims;
using OpenAI;


namespace RealEstate
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Add services to the container.

            builder.Services.AddControllers();
            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();

            builder.Services.AddSwaggerGen(options =>
            {
                options.SwaggerDoc("v1", new OpenApiInfo { Title = "Real Estate API", Version = "v1" });
                options.AddSecurityDefinition(JwtBearerDefaults.AuthenticationScheme, new OpenApiSecurityScheme()
                {
                    Name = "Authorization",
                    In = ParameterLocation.Header,
                    Type = SecuritySchemeType.ApiKey,
                    Scheme = JwtBearerDefaults.AuthenticationScheme

                });
                options.AddSecurityRequirement(new OpenApiSecurityRequirement()
                {
                    {
                        new OpenApiSecurityScheme
                        {
                            Reference=new OpenApiReference
                            {
                                Type=ReferenceType.SecurityScheme,
                                Id=JwtBearerDefaults.AuthenticationScheme
                            },
                            Scheme="Oauth2",
                            Name=JwtBearerDefaults.AuthenticationScheme,
                            In=ParameterLocation.Header
                        },
                        new List<string>()
                    }
                });
            });

            builder.Services.AddDbContext<RealEstateDbContext>(opt =>
                opt.UseSqlServer(builder.Configuration.GetConnectionString("RealEstateConnection"))
            );


            builder.Services.AddIdentityCore<Account>()
                .AddRoles<IdentityRole>()
                .AddTokenProvider<DataProtectorTokenProvider<Account>>("RealEstate")
                .AddEntityFrameworkStores<RealEstateDbContext>()
                .AddDefaultTokenProviders();


            builder.Services.Configure<IdentityOptions>(options =>
            {
                //options.User.RequireUniqueEmail = true;
                options.SignIn.RequireConfirmedEmail = true;
            });

            //Google Authentication
            builder.Services.AddAuthentication().AddGoogle(options =>
            {
                options.ClientId = builder.Configuration.GetSection("GoogleKeys:ClientId").Value;
                options.ClientSecret = builder.Configuration.GetSection("GoogleKeys:ClientSecret").Value;
            });


            builder.Services.Configure<IdentityOptions>(options =>
            {
                options.Password.RequireDigit = true;
                options.Password.RequireLowercase = true;
                options.Password.RequireNonAlphanumeric = true;
                options.Password.RequireUppercase = true;
                options.Password.RequiredLength = 8;
                options.Password.RequiredUniqueChars = 1;
            });

            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
            .AddJwtBearer(options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    ValidIssuer = builder.Configuration["Jwt:Issuer"],
                    ValidAudience = builder.Configuration["Jwt:Audience"],
                    IssuerSigningKey = new SymmetricSecurityKey(
                        Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!)),
                    NameClaimType = ClaimTypes.NameIdentifier
                };

                // ?? ADD THIS FOR SIGNALR
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];

                        // If the request is for our hub...
                        var path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/api/Chat/chatHub"))
                        {
                            // Read the token from the query string
                            context.Token = accessToken;
                        }
                        return Task.CompletedTask;
                    }
                };
            });


            // Add Scoped for repositories
            builder.Services.AddAutoMapper(typeof(Program));
            builder.Services.AddScoped<IPasswordValidator<Account>, PasswordLengthValidator<Account>>();
            builder.Services.AddScoped<IBuyerRepository, BuyerRepository>();
            builder.Services.AddScoped<ISellerRepository, SellerRepository>();
            builder.Services.AddScoped<IAgentRepository, AgentRepository>();
            builder.Services.AddScoped<IPaymentRepository, PaymentRepository>();
            builder.Services.AddScoped<ICartRepository, CartRepository>();
            builder.Services.AddScoped<IOrderItemRepository, OrderItemRepository>();
            builder.Services.AddScoped<IOrderRepository, OrderRepository>();
            builder.Services.AddScoped<ISubscriptionRepository, SubscriptionRepository>();
            builder.Services.AddScoped<ISubscriptionPlanRepository, SubscriptionPlanRepository>();
            builder.Services.AddScoped<IOrderItemRepository, OrderItemRepository>();
            builder.Services.AddScoped<IPropertyRepository, PropertyRepository>();
            builder.Services.AddScoped<IAppointmentRepository, AppointmentRepository>();
            builder.Services.AddScoped<IPropertyBidRepository, PropertyBidRepository>();
            builder.Services.AddScoped<IAddressRepository, AddressRepository>();
            builder.Services.AddScoped<IProductRepository, ProductRepository>();
            builder.Services.AddScoped<ICategoryRepository, CategoryRepository>();
            builder.Services.AddScoped<IWishListRepository, WishlistRepository>();
            builder.Services.AddScoped<IAuctionRepository, AuctionRepository>();
            builder.Services.AddScoped<IMessageRepository, MessageRepository>();
            builder.Services.AddScoped<IConversationRepository, ConversationRepository>();
            builder.Services.AddScoped<ICartRepository, CartRepository>();
            builder.Services.AddScoped<IReviewRepository, ReviewRepository>();
            builder.Services.AddScoped<IAdminRepository, AdminRepository>();
            builder.Services.AddScoped<IContractRepository, ContractRepository>();
            builder.Services.AddScoped<IShippingRepository, ShippingRepository>();
            builder.Services.AddScoped<IProductStockRepository, ProductStockRepository>();
            builder.Services.AddScoped<IAdminDashboardRepository, AdminDashboardRepository>();
            builder.Services.AddScoped<IAuctionBuyerRepository, AuctionBuyerRepository>();
            builder.Services.AddScoped<JWTService>();
            builder.Services.AddScoped<FileService>();
            builder.Services.AddScoped<EmailService>();
            builder.Services.AddScoped<ReviewService>();
            builder.Services.AddScoped<CartService>();
            builder.Services.AddScoped<ShippingFeesService>();
            builder.Services.AddScoped<GoogleService>();
    


            // builder.Services.AddSingleton<PayPalService>();// Maybe review if it's better to use singleton or scoped here later
            builder.Services.AddScoped<PayPalService>();

            //builder.Services.Configure<PayPalSettings>(builder.Configuration.GetSection("PayPal"));
          
            // Register other services
            builder.Services.AddSingleton<StripeService>();

            builder.Services.AddHttpClient<PayPalService>();
            builder.Services.AddHttpClient();

            // string configurations
            Stripe.StripeConfiguration.ApiKey = builder.Configuration["Stripe:SecretKey"];

            // IMPORTANTTTTT
            //builder.Services.AddHostedService<AuctionStatusUpdater>();

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("AllowAngularApp", policy =>
                    policy
                        .WithOrigins("http://localhost:4200", "https://mariam-510.github.io")
                        .AllowAnyHeader()
                        .AllowAnyMethod()
                        .AllowCredentials()
                );
            });

            // Add SignalR
            builder.Services.AddSignalR();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseCors("AllowAngularApp");

            app.UseHttpsRedirection();
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseStaticFiles();

            app.MapControllers();

            app.MapHub<ChatHub>("/api/Chat/chatHub");

            // Map Hub
            app.MapHub<AuctionHub>("/auctionHub");


            app.Run();
        }
    }
}
