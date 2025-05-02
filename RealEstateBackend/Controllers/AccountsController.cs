using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Tokens;
using Newtonsoft.Json.Linq;
using RealEstate.JWT;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.AccountDto;
using RealEstate.Models.Dtos.EmailDto;
using RealEstate.Models.Dtos.JWTDto;
using RealEstate.Repositories;
using RealEstate.Services;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;

//using Stripe;
using System.Text;
using System.Transactions;

using Account = RealEstate.Models.Domains.Account;
using System.Text.Json;
using RealEstate.Models.Dtos.BuyerDto;
using RealEstate.Models.DTOs.AccountDto;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        public UserManager<Account> UserManager { get; }
        public JWTService TokenService { get; }
        public IMapper Mapper { get; }
        public EmailService EmailService { get; }
        public IBuyerRepository BuyerRepository { get; }
        public ISellerRepository SellerRepository { get; }
        public IAgentRepository AgentRepository { get; }
        public FileService FileService { get; }
        public ICartRepository CartRepository { get; }
        public ISubscriptionRepository SubscriptionRepository { get; }
        public ISubscriptionPlanRepository SubscriptionPlanRepository { get; }
        public GoogleService GoogleService { get; }
        public IPropertyRepository PropertyRepository { get; }
        public IAdminRepository AdminRepository { get; }

        public AccountsController(UserManager<Account> userManager, JWTService tokenService, IMapper Mapper, EmailService emailService,
            IBuyerRepository buyerRepository, ISellerRepository sellerRepository, IAgentRepository agentRepository, FileService fileService,
            ICartRepository cartRepository, ISubscriptionRepository subscriptionRepository, ISubscriptionPlanRepository subscriptionPlanRepository,
            GoogleService googleService, IPropertyRepository propertyRepository, IAdminRepository adminRepository)
        {
            UserManager = userManager;
            TokenService = tokenService;
            this.Mapper = Mapper;
            EmailService = emailService;
            BuyerRepository = buyerRepository;
            SellerRepository = sellerRepository;
            AgentRepository = agentRepository;
            FileService = fileService;
            CartRepository = cartRepository;
            SubscriptionRepository = subscriptionRepository;
            SubscriptionPlanRepository = subscriptionPlanRepository;
            GoogleService = googleService;
            PropertyRepository = propertyRepository;
            AdminRepository = adminRepository;
        }


        [HttpGet("TestAuth")]
        [Authorize]
        public async Task<IActionResult> TestAuth()
        {
            return Ok(new { message = "Hello" });
        }


        [HttpPost]
        [Route("Register")]
        public async Task<IActionResult> Register([FromForm] RegisterSellerOrBuyerDto registerSellerOrBuyerDto)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    if (!ModelState.IsValid)
                    {
                        return BadRequest(ModelState);
                    }

                    var existingUser = await UserManager.Users
                        .Where(u => u.Email.ToLower() == registerSellerOrBuyerDto.Email.ToLower() && !u.IsDeleted)
                        .FirstOrDefaultAsync();

                    if (existingUser != null)
                    {
                        return BadRequest(new { message = "Email already exists." });
                    }

                    var account = Mapper.Map<Account>(registerSellerOrBuyerDto);
                    account.CreatedAt = DateTime.Now.AddHours(1);
                    account.UserName = registerSellerOrBuyerDto.Email;
                    account.EmailConfirmationCode = null;
                    account.CodeGeneratedAt = null;
                    account.PasswordResetCode = null;
                    account.ResetCodeGeneratedAt = null;

                    var registerResult = await UserManager.CreateAsync(account, registerSellerOrBuyerDto.Password);

                    if (registerResult.Succeeded)
                    {
                        account.ImageUrl = FileService.UploadFile("UserImages", registerSellerOrBuyerDto.Image);
                        await UserManager.UpdateAsync(account);

                        if (registerSellerOrBuyerDto.IsBuyer)
                        {
                            registerResult = await UserManager.AddToRoleAsync(account, "Buyer");

                            if (registerResult.Succeeded)
                            {
                                var buyer = Mapper.Map<Buyer>(registerSellerOrBuyerDto);
                                buyer.IsDeleted = false;
                                buyer.AccountId = account.Id;

                                buyer = await BuyerRepository.CreateAsync(buyer);

                                var cart = new Cart()
                                {
                                    TotalPrice = 0,
                                    IsDeleted = false,
                                    BuyerId = buyer.Id
                                };

                                cart = await CartRepository.CreateAsync(cart);

                                if (buyer == null)
                                    return StatusCode(500, new { message = "An error occurred while creating" });

                            }
                            else
                            {
                                transactionScope.Dispose();
                                return StatusCode(500, registerResult.Errors);
                            }
                        }
                        else
                        {
                            registerResult = await UserManager.AddToRoleAsync(account, "Seller");

                            if (registerResult.Succeeded)
                            {
                                var seller = Mapper.Map<Seller>(registerSellerOrBuyerDto);
                                seller.IsDeleted = false;
                                seller.AccountId = account.Id;

                                seller = await SellerRepository.CreateAsync(seller);

                                if (seller == null)
                                    return StatusCode(500, new { message = "An error occurred while creating" });

                                var subscriptionPlan = await SubscriptionPlanRepository.GetByNameAsync("Free");
                                if (subscriptionPlan == null)
                                {
                                    return StatusCode(500, new { message = "An error occurred while creating subscription plan" });
                                }
                                Subscription subscription = new Subscription()
                                {
                                    SubscriptionPlanId = subscriptionPlan.Id,
                                    AvailableProperties = subscriptionPlan.MaxAllowedProperties,
                                    SellerId = seller.Id,
                                    IsDeleted = false
                                };

                                await SubscriptionRepository.AddAsync(subscription);

                            }
                            else
                            {
                                transactionScope.Dispose();
                                return StatusCode(500, registerResult.Errors);
                            }
                        }

                        // Generate a random 6-digit confirmation code
                        var confirmationCode = new Random().Next(100000, 999999).ToString();

                        // Store the code temporarily (in DB or cache)
                        account.EmailConfirmationCode = confirmationCode;
                        account.CodeGeneratedAt = DateTime.Now.AddHours(1);
                        await UserManager.UpdateAsync(account);

                        string emailBody = $@"
                            Dear {account.Email},<br/>
                            Thank you for registering.<br/>
                            Your email confirmation code is: <strong>{confirmationCode}</strong><br/>
                            This code will expire in 2 minutes.<br/>
                            Please enter this code in the app to confirm your email.";


                        EmailDto emailDto = new EmailDto
                        {
                            To = account.Email,
                            Subject = "Email Confirmation",
                            Body = emailBody
                        };

                        bool isEmailSent = EmailService.SendEmail(emailDto);

                        if (!isEmailSent)
                        {
                            transactionScope.Dispose();
                            return StatusCode(500, new { message = "Failed to send confirmation email. Please try again." });
                        }

                        transactionScope.Complete();
                        return Ok(new { message = "Registered Successfully! Check your email to confirm your account." });

                    }
                    transactionScope.Dispose();
                    return StatusCode(500, registerResult.Errors);
                }
                catch (Exception ex)
                {
                    transactionScope.Dispose();
                    return StatusCode(500, new { message = "An error occurred while processing your request." });
                }
            }

        }


        [HttpPost]
        [Route("RegisterAgent")]
        public async Task<IActionResult> RegisterAgent([FromForm] RegisterAgentDto registerAgentDto)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    if (!ModelState.IsValid)
                    {
                        return BadRequest(ModelState);
                    }

                    var existingUser = await UserManager.Users
                        .Where(u => u.Email.ToLower() == registerAgentDto.Email.ToLower() && !u.IsDeleted)
                        .FirstOrDefaultAsync();

                    if (existingUser != null)
                    {
                        return BadRequest(new { message = "Email already exists." });
                    }

                    var existingAgent = await AgentRepository.CommercialRegisterExistsAsync(registerAgentDto.CommercialRegister);
                    if (existingAgent)
                    {
                        return BadRequest(new { message = "This Commercial Register number already exists." });
                    }

                    var account = Mapper.Map<Account>(registerAgentDto);
                    account.CreatedAt = DateTime.Now.AddHours(1);
                    account.UserName = registerAgentDto.Email;
                    account.EmailConfirmationCode = null;
                    account.CodeGeneratedAt = null;
                    account.PasswordResetCode = null;
                    account.ResetCodeGeneratedAt = null;

                    var registerResult = await UserManager.CreateAsync(account, registerAgentDto.Password);

                    if (registerResult.Succeeded)
                    {
                        account.ImageUrl = FileService.UploadFile("UserImages", registerAgentDto.Image);
                        await UserManager.UpdateAsync(account);

                        registerResult = await UserManager.AddToRoleAsync(account, "Agent");

                        if (registerResult.Succeeded)
                        {
                            var agent = Mapper.Map<Agent>(registerAgentDto);
                            agent.IsDeleted = false;
                            agent.ApprovalStatus = ApprovalStatus.Pending;
                            agent.AccountId = account.Id;

                            agent = await AgentRepository.CreateAsync(agent);

                            if (agent == null)
                                return StatusCode(500, new { message = "An error occurred while creating" });

                            var subscriptionPlan = await SubscriptionPlanRepository.GetByNameAsync("Free");
                            if (subscriptionPlan == null)
                            {
                                return StatusCode(500, new { message = "An error occurred while creating subscription plan" });
                            }

                            Subscription subscription = new Subscription()
                            {
                                SubscriptionPlanId = subscriptionPlan.Id,
                                AvailableProperties = subscriptionPlan.MaxAllowedProperties,
                                AgentId = agent.Id,
                                IsDeleted = false
                            };

                            await SubscriptionRepository.AddAsync(subscription);

                            // Generate a random 6-digit confirmation code
                            var confirmationCode = new Random().Next(100000, 999999).ToString();

                            // Store the code temporarily (in DB or cache)
                            account.EmailConfirmationCode = confirmationCode;
                            account.CodeGeneratedAt = DateTime.Now.AddHours(1);
                            await UserManager.UpdateAsync(account);

                            string emailBody = $@"
                            Dear {account.Email},<br/>
                            Thank you for registering.<br/>
                            Your email confirmation code is: <strong>{confirmationCode}</strong><br/>
                            This code will expire in 2 minutes.<br/>
                            Please enter this code in the app to confirm your email.";


                            EmailDto emailDto = new EmailDto
                            {
                                To = account.Email,
                                Subject = "Email Confirmation",
                                Body = emailBody
                            };

                            bool isEmailSent = EmailService.SendEmail(emailDto);

                            if (!isEmailSent)
                            {
                                transactionScope.Dispose();
                                return StatusCode(500, new { message = "Failed to send confirmation email. Please try again." });
                            }

                            transactionScope.Complete();
                            return Ok(new { message = "Registered Successfully! Check your email to confirm your account." });

                        }
                        else
                        {
                            transactionScope.Dispose();
                            return StatusCode(500, registerResult.Errors);
                        }

                    }
                    transactionScope.Dispose();
                    return StatusCode(500, registerResult.Errors);
                }
                catch (Exception ex)
                {
                    transactionScope.Dispose();
                    return StatusCode(500, new { message = "An error occurred while processing your request." });
                }
            }

        }


        [HttpPost]
        [Route("Login")]
        public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var account = await UserManager.Users
                .Where(u => u.Email.ToLower() == loginDto.Email.ToLower() && !u.IsDeleted)
                .FirstOrDefaultAsync();

            if (account != null && !account.IsDeleted)
            {
                var isEmailConfirmed = await UserManager.IsEmailConfirmedAsync(account);
                if (!isEmailConfirmed)
                {
                    return StatusCode(StatusCodes.Status403Forbidden, new { message = "Please confirm your email before logging in." });
                }

                var checkPasswordResult = await UserManager.CheckPasswordAsync(account, loginDto.Password);
                if (checkPasswordResult)
                {
                    var roles = await UserManager.GetRolesAsync(account);

                    int userId = 0;
                    var fName = "";
                    var lName = "";
                    var imageUrl = account.ImageUrl;

                    if (roles.Contains("Agent"))
                    {
                        var agent = await AgentRepository.GetByAccountIdAsync(account.Id);
                        if (agent != null)
                        {
                            if (agent.ApprovalStatus == ApprovalStatus.Pending)
                            {
                                return BadRequest(new { message = "You can't log in until your account is approved." });
                            }
                            if (agent.ApprovalStatus == ApprovalStatus.Rejected)
                            {
                                return BadRequest(new { message = "Your account has been rejected. Please contact support for further details." });
                            }
                            userId = agent.Id;
                            fName = agent.Name;
                        }
                    }
                    else if (roles.Contains("Seller"))
                    {
                        var seller = await SellerRepository.GetByAccountIdAsync(account.Id);
                        if (seller != null)
                        {
                            userId = seller.Id;
                            fName = seller.FirstName;
                            lName = seller.LastName;
                        }

                    }
                    else if (roles.Contains("Buyer"))
                    {
                        var buyer = await BuyerRepository.GetByAccountIdAsync(account.Id);
                        if (buyer != null)
                        {
                            userId = buyer.Id;
                            fName = buyer.FirstName;
                            lName = buyer.LastName;
                        }
                    }
                    else if (roles.Contains("Admin"))
                    {
                        var admin = await AdminRepository.GetByAccountIdAsync(account.Id);
                        if (admin != null)
                        {
                            userId = admin.Id;
                            fName = admin.Name;
                        }
                    }


                    var userClaims = new UserClaimsDto
                    {
                        UserId = userId,
                        FirstName = fName,
                        LastName = lName,
                        ImageUrl = imageUrl
                    };

                    var jwtToken = TokenService.CreateJWTToken(account, roles.ToList(), userClaims);

                    var tokenDto = new JWTTokenDto()
                    {
                        JwtToken = jwtToken,
                    };

                    return Ok(new { tokenDto });
                }
            }
            return Unauthorized(new { message = "UserName or Password Incorrect" });
        }


        [HttpPost]
        [Route("ConfirmEmailCode")]
        public async Task<IActionResult> ConfirmEmailCode([FromForm] string email, [FromForm] string code)
        {
            if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(code))
                return BadRequest(new { message = "Email and code are required." });

            var user = await UserManager.Users
                .Where(u => u.Email.ToLower() == email.ToLower() && !u.IsDeleted)
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "User not found." });

            if (user.EmailConfirmed)
                return Conflict(new { message = "Email is already confirmed." });

            // Optional: Expire the code after 2 minutes
            if (user.CodeGeneratedAt.HasValue && (DateTime.Now.AddHours(1) - user.CodeGeneratedAt.Value).TotalMinutes > 2)
                return BadRequest(new { message = "The confirmation code has expired." });

            if (user.EmailConfirmationCode != code)
                return BadRequest(new { message = "Invalid confirmation code." });

            user.EmailConfirmed = true;
            user.EmailConfirmationCode = null;
            user.CodeGeneratedAt = null;
            await UserManager.UpdateAsync(user);

            return Ok(new { message = "Email confirmed successfully!" });
        }


        [HttpPost]
        [Route("ResendConfirmEmail")]
        public async Task<IActionResult> ResendConfirmationEmail(EmailFormDto emailFormDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var account = await UserManager.Users
                    .Where(u => u.Email.ToLower() == emailFormDto.Email.ToLower() && !u.IsDeleted)
                    .FirstOrDefaultAsync();

                if (account == null)
                {
                    return NotFound(new { message = "Email not found." });
                }
                else if (account.EmailConfirmed)
                {
                    return Conflict(new { message = "Email is already confirmed." });
                }
                else
                {
                    // Generate a random 6-digit confirmation code
                    var confirmationCode = new Random().Next(100000, 999999).ToString();

                    // Store the code temporarily (in DB or cache)
                    account.EmailConfirmationCode = confirmationCode;
                    account.CodeGeneratedAt = DateTime.Now.AddHours(1);
                    await UserManager.UpdateAsync(account);

                    string emailBody = $@"
                            Dear {account.Email},<br/>
                            Thank you for registering.<br/>
                            Your email confirmation code is: <strong>{confirmationCode}</strong><br/>
                            This code will expire in 2 minutes.<br/>
                            .Please enter this code in the app to confirm your email.";


                    EmailDto emailDto = new EmailDto
                    {
                        To = account.Email,
                        Subject = "Email Confirmation",
                        Body = emailBody
                    };

                    bool isEmailSent = EmailService.SendEmail(emailDto);

                    if (!isEmailSent)
                    {
                        return StatusCode(500, new { message = "Failed to send confirmation email. Please try again." });
                    }

                    return Ok(new { message = "Registered Successfully! Check your email to confirm your account." });

                }
            }

            catch (Exception ex)
            {
                return StatusCode(500, new { message = "Failed to send confirmation email. Please try again." });

            }
        }


        [HttpPost]
        [Route("ForgotPassword")]
        public async Task<IActionResult> ForgotPassword([FromBody] EmailFormDto emailFormDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await UserManager.Users
                    .Where(u => u.Email.ToLower() == emailFormDto.Email.ToLower() && !u.IsDeleted)
                    .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "Email doesn't exist." });

            if (!user.EmailConfirmed)
                return BadRequest(new { message = "Please confirm your email first." });

            var roles = await UserManager.GetRolesAsync(user);

            if (roles.Contains("Agent"))
            {
                var agent = await AgentRepository.GetByAccountIdAsync(user.Id);
                if (agent != null)
                {
                    if (agent.ApprovalStatus == ApprovalStatus.Pending)
                    {
                        return BadRequest(new { message = "You can't reset password until your account is approved." });
                    }
                    if (agent.ApprovalStatus == ApprovalStatus.Rejected)
                    {
                        return BadRequest(new { message = "Your account has been rejected. Please contact support for further details." });
                    }

                }
            }

            // Generate a 6-digit reset code
            var resetCode = new Random().Next(100000, 999999).ToString();

            // Store the reset code and timestamp
            user.PasswordResetCode = resetCode;
            user.ResetCodeGeneratedAt = DateTime.UtcNow;
            await UserManager.UpdateAsync(user);

            var emailBody = $@"
                    <p>Your password reset code is: <strong>{resetCode}</strong></p>
                    <p>This code will expire in 2 minutes.</p>";

            EmailDto emailDto = new EmailDto
            {
                To = user.Email,
                Subject = "Password Reset Code",
                Body = emailBody
            };

            var isEmailSent = EmailService.SendEmail(emailDto);
            if (!isEmailSent)
                return StatusCode(500, new { message = "Failed to send reset code." });

            return Ok(new { message = "Password reset code sent successfully." });
        }


        [HttpPost]
        [Route("ValidateResetCode")]
        public async Task<IActionResult> ValidateResetCode([FromBody] ValidateResetCodeDto validateResetCodeDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await UserManager.Users
                .Where(u => u.Email.ToLower() == validateResetCodeDto.Email.ToLower() && !u.IsDeleted)
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "User not found." });

            if (user.PasswordResetCode != validateResetCodeDto.Code)
                return BadRequest(new { message = "Invalid reset code." });

            if (user.ResetCodeGeneratedAt.HasValue &&
                (DateTime.UtcNow - user.ResetCodeGeneratedAt.Value).TotalMinutes > 2)
            {
                return BadRequest(new { message = "Reset code has expired." });
            }

            return Ok(new { message = "Code is valid." });
        }


        [HttpPost]
        [Route("ResetPassword")]
        public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto resetPasswordDto)
        {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var user = await UserManager.Users
                .Where(u => u.Email.ToLower() == resetPasswordDto.Email.ToLower() && !u.IsDeleted)
                .FirstOrDefaultAsync();

            if (user == null)
                return NotFound(new { message = "User not found." });

            // Optional: You can re-check code and expiration here for added security
            if (user.PasswordResetCode == null || user.ResetCodeGeneratedAt == null)
            {
                return BadRequest(new { message = "Reset code is invalid." });
            }

            var resetToken = await UserManager.GeneratePasswordResetTokenAsync(user);

            var result = await UserManager.ResetPasswordAsync(user, resetToken, resetPasswordDto.NewPassword);

            if (result.Succeeded)
            {
                // Clear code after success
                user.PasswordResetCode = null;
                user.ResetCodeGeneratedAt = null;
                await UserManager.UpdateAsync(user);

                return Ok(new { message = "Password reset successful." });
            }

            return StatusCode(500, new { message = "Password reset failed.", errors = result.Errors });
        }


        [HttpPost("google")]
        public async Task<IActionResult> ExternalLoginWithGoogle([FromBody] ExternalLoginDto dto)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    // 1. Validate the ID token
                    var (isValid, claims) = await GoogleService.ValidateGoogleToken(dto.IdToken);

                    if (!isValid)
                        return Unauthorized("Invalid Google token");

                    var userInfo = await GoogleService.GetGoogleUserInfoAsync(dto.AccessToken);

                    //Console.WriteLine($"infoooooo: {userInfo}");

                    // 3. Check if user exists in your database
                    var user = await UserManager.Users
                        .Where(u => u.Email.ToLower() == userInfo.Email.ToLower() && !u.IsDeleted)
                        .FirstOrDefaultAsync();


                    if (user == null)
                    {
                        // Create new user
                        user = new Account
                        {
                            Email = userInfo.Email,
                            UserName = userInfo.Email,
                            CreatedAt = DateTime.Now.AddHours(1),
                            ImageUrl = null,
                            EmailConfirmationCode = null,
                            CodeGeneratedAt = null,
                            PasswordResetCode = null,
                            ResetCodeGeneratedAt = null,
                            EmailConfirmed = true,
                        };

                        var result = await UserManager.CreateAsync(user);
                        if (!result.Succeeded)
                        {
                            transactionScope.Dispose();
                            return StatusCode(500, result.Errors);
                        }

                        result = await UserManager.AddToRoleAsync(user, "Buyer");

                        if (result.Succeeded)
                        {
                            Buyer buyer = new Buyer
                            {
                                FirstName = userInfo.GivenName,
                                LastName = userInfo.FamilyName,
                                IsDeleted = false,
                                AccountId = user.Id
                            };
                            buyer = await BuyerRepository.CreateAsync(buyer);

                            if (buyer == null)
                                return StatusCode(500, new { message = "An error occurred while creating" });

                            var cart = new Cart()
                            {
                                TotalPrice = 0,
                                IsDeleted = false,
                                BuyerId = buyer.Id
                            };

                            cart = await CartRepository.CreateAsync(cart);
                        }
                        else
                        {
                            transactionScope.Dispose();
                            return StatusCode(500, result.Errors);
                        }

                    }

                    var roles = await UserManager.GetRolesAsync(user);

                    int userId = 0;
                    var fName = "";
                    var lName = "";
                    var imageUrl = user.ImageUrl;

                    if (roles.Contains("Buyer"))
                    {
                        var buyer = await BuyerRepository.GetByAccountIdAsync(user.Id);
                        if (buyer != null)
                        {
                            userId = buyer.Id;
                            fName = buyer.FirstName;
                            lName = buyer.LastName;
                        }
                    }

                    var userClaims = new UserClaimsDto
                    {
                        UserId = userId,
                        FirstName = fName,
                        LastName = lName,
                        ImageUrl = imageUrl
                    };

                    var jwtToken = TokenService.CreateJWTToken(user, roles.ToList(), userClaims);

                    var tokenDto = new JWTTokenDto()
                    {
                        JwtToken = jwtToken,
                    };

                    transactionScope.Complete();
                    return Ok(new { tokenDto });
                }
                catch (Exception ex)
                {
                    return StatusCode(500, $"Internal server error: {ex.Message}");
                }
            }
        }


        [HttpPost("login/google")]
        public async Task<IActionResult> ExternalLoginGoogle([FromBody] GoogleUserInfo dto)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    if (!ModelState.IsValid)
                    {
                        return BadRequest(ModelState);
                    }

                    // 3. Check if user exists in your database
                    var user = await UserManager.Users
                        .Where(u => u.Email.ToLower() == dto.Email.ToLower() && !u.IsDeleted)
                        .FirstOrDefaultAsync();

                    if (user == null)
                    {
                        // Create new user
                        user = new Account
                        {
                            Email = dto.Email,
                            UserName = dto.Email,
                            CreatedAt = DateTime.Now.AddHours(1),
                            ImageUrl = null,
                            EmailConfirmationCode = null,
                            CodeGeneratedAt = null,
                            PasswordResetCode = null,
                            ResetCodeGeneratedAt = null,
                            EmailConfirmed = true,
                        };

                        var result = await UserManager.CreateAsync(user);
                        if (!result.Succeeded)
                        {
                            transactionScope.Dispose();
                            return StatusCode(500, result.Errors);
                        }

                        result = await UserManager.AddToRoleAsync(user, "Buyer");

                        if (result.Succeeded)
                        {
                            Buyer buyer = new Buyer
                            {
                                FirstName = dto.GivenName ?? dto.Name ?? "",
                                LastName = dto.FamilyName ?? "",
                                IsDeleted = false,
                                AccountId = user.Id
                            };
                            buyer = await BuyerRepository.CreateAsync(buyer);

                            if (buyer == null)
                                return StatusCode(500, new { message = "An error occurred while creating" });

                            var cart = new Cart()
                            {
                                TotalPrice = 0,
                                IsDeleted = false,
                                BuyerId = buyer.Id
                            };

                            cart = await CartRepository.CreateAsync(cart);
                        }
                        else
                        {
                            transactionScope.Dispose();
                            return StatusCode(500, result.Errors);
                        }

                    }

                    var roles = await UserManager.GetRolesAsync(user);

                    int userId = 0;
                    var fName = "";
                    var lName = "";
                    var imageUrl = user.ImageUrl;

                    if (roles.Contains("Buyer"))
                    {
                        var buyer = await BuyerRepository.GetByAccountIdAsync(user.Id);
                        if (buyer != null)
                        {
                            userId = buyer.Id;
                            fName = buyer.FirstName;
                            lName = buyer.LastName;
                        }
                    }

                    var userClaims = new UserClaimsDto
                    {
                        UserId = userId,
                        FirstName = fName,
                        LastName = lName,
                        ImageUrl = imageUrl
                    };

                    var jwtToken = TokenService.CreateJWTToken(user, roles.ToList(), userClaims);

                    var tokenDto = new JWTTokenDto()
                    {
                        JwtToken = jwtToken,
                    };

                    transactionScope.Complete();
                    return Ok(new { tokenDto });
                }
                catch (Exception ex)
                {
                    return StatusCode(500, $"Internal server error: {ex.Message}");
                }
            }
        }


        [HttpGet("GetRecipientAccountId/{propertyId}")]
        [Authorize(Roles = "Buyer")]
        //public async Task<ActionResult<UserDto>> GetByPropertyId(int propertyId)
        public async Task<ActionResult> GetByPropertyId(int propertyId)
        {
            // Fetch the property details to get the OwnerId
            var property = await PropertyRepository.GetByIdAsync(propertyId);

            if (property == null)
            {
                return NotFound(new { message = "Property not found." });
            }

            // Fetch the owner of the property
            var owner = await UserManager.FindByIdAsync(property.AgentId != null ? property.Agent.AccountId : property.Seller.AccountId); // Assuming Property entity has OwnerId

            if (owner == null)
            {
                return NotFound(new { message = "Property owner not found." });
            }

            // Retrieve the user's roles
            var roles = await UserManager.GetRolesAsync(owner);

            // Map the user data to the DTO
            //var userDto = new UserDto
            //{
            //    AccountId = owner.Id,  // From IdentityUser
            //    UserId = null,
            //    Email = owner.Email,
            //    FirstName = owner.UserName,
            //    LastName = null,
            //    ImageUrl = owner.ImageUrl,
            //    Roles = roles.ToList(),
            //    TokenExpiration = null  // Example expiration logic
            //};

            return Ok(owner.Id);
        }

        [HttpGet("GetUserInfo/{accountId}")]
        public async Task<IActionResult> GetUserByAccountId(string accountId)
        {
            var buyer = await BuyerRepository.GetByAccountIdAsync(accountId);
            if (buyer != null)
            {
                var dto = new UserDto
                {
                    UserId = buyer.Id,
                    FirstName = buyer.FirstName,
                    LastName = buyer.LastName,
                    AccountId = buyer.AccountId!,
                    ImageUrl = buyer.Account.ImageUrl,
                    Roles = ["Buyer"]
                };
                return Ok(dto);
            }

            var seller = await SellerRepository.GetByAccountIdAsync(accountId);
            if (seller != null)
            {
                var dto = new UserDto
                {
                    UserId = seller.Id,
                    FirstName = seller.FirstName,
                    LastName = seller.LastName,
                    AccountId = seller.AccountId!,
                    ImageUrl = seller.Account.ImageUrl,
                    Roles = ["Seller"]
                };
                return Ok(dto);
            }

            var agent = await AgentRepository.GetByAccountIdAsync(accountId);
            if (agent != null)
            {
                var dto = new UserDto
                {
                    UserId = agent.Id,
                    FirstName = agent.Name,
                    LastName = null,
                    AccountId = agent.AccountId!,
                    ImageUrl = agent.Account.ImageUrl,
                    Roles = ["Agent"]
                };
                return Ok(dto);
            }

            return NotFound($"No user found with AccountId: {accountId}");
        }
    }
}
