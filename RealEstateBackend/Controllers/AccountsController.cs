using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using RealEstate.JWT;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.AccountDto;
using RealEstate.Models.Dtos.EmailDto;
using RealEstate.Repositories;
using RealEstate.Services;
using Stripe;
using System.Text;
using System.Transactions;

using Account = RealEstate.Models.Domains.Account;

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
        public ICartRepository CartRepository { get; }

        public AccountsController(UserManager<Account> userManager, JWTService tokenService, IMapper Mapper, EmailService emailService,
            IBuyerRepository buyerRepository, ISellerRepository sellerRepository, IAgentRepository agentRepository, ICartRepository cartRepository)
        {
            UserManager = userManager;
            TokenService = tokenService;
            this.Mapper = Mapper;
            EmailService = emailService;
            BuyerRepository = buyerRepository;
            SellerRepository = sellerRepository;
            AgentRepository = agentRepository;
            CartRepository = cartRepository;
        }


        [HttpGet("TestAuth")]
        [Authorize]
        public async Task<IActionResult> TestAuth()
        {
            return Ok("Hello");
        }


        [HttpPost]
        [Route("Register")]
        public async Task<IActionResult> Register([FromBody] RegisterSellerOrBuyerDto registerSellerOrBuyerDto)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    if (!ModelState.IsValid)
                    {
                        return BadRequest(ModelState);
                    }

                    //var existingUser = await UserManager.FindByEmailAsync(registerSellerOrBuyerDto.Email);

                    var existingUser = await UserManager.Users
                        .Where(u => u.Email.ToLower() == registerSellerOrBuyerDto.Email.ToLower() && !u.IsDeleted)
                        .FirstOrDefaultAsync();

                    if (existingUser != null)
                    {
                        return BadRequest(new { message = "Email already exists." });
                    }

                    var account = Mapper.Map<Account>(registerSellerOrBuyerDto);
                    account.CreatedAt = DateTime.Now;
                    account.UserName = registerSellerOrBuyerDto.Email;
                    account.EmailConfirmationCode = null;
                    account.CodeGeneratedAt = null;
                    account.PasswordResetCode = null;
                    account.ResetCodeGeneratedAt = null;

                    var registerResult = await UserManager.CreateAsync(account, registerSellerOrBuyerDto.Password);

                    if (registerResult.Succeeded)
                    {
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
                        account.CodeGeneratedAt = DateTime.Now;
                        await UserManager.UpdateAsync(account);

                        string emailBody = $@"
                            Dear {account.Email},<br/>
                            Thank you for registering.<br/>
                            Your email confirmation code is: <strong>{confirmationCode}</strong><br/>
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
        public async Task<IActionResult> RegisterAgent([FromBody] RegisterAgentDto registerAgentDto)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    if (!ModelState.IsValid)
                    {
                        return BadRequest(ModelState);
                    }

                    //var existingUser = await UserManager.FindByEmailAsync(registerAgentDto.Email);

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
                    account.CreatedAt = DateTime.UtcNow;
                    account.UserName = registerAgentDto.Email;
                    account.EmailConfirmationCode = null;
                    account.CodeGeneratedAt = null;
                    account.PasswordResetCode = null;
                    account.ResetCodeGeneratedAt = null;

                    var registerResult = await UserManager.CreateAsync(account, registerAgentDto.Password);

                    if (registerResult.Succeeded)
                    {
                        registerResult = await UserManager.AddToRoleAsync(account, "Agent");

                        if (registerResult.Succeeded)
                        {
                            var agent = Mapper.Map<Agent>(registerAgentDto);
                            agent.IsDeleted = false;
                            agent.AccountId = account.Id;

                            agent = await AgentRepository.CreateAsync(agent);

                            if (agent == null)
                                return StatusCode(500, new { message = "An error occurred while creating" });

                            // Generate a random 6-digit confirmation code
                            var confirmationCode = new Random().Next(100000, 999999).ToString();

                            // Store the code temporarily (in DB or cache)
                            account.EmailConfirmationCode = confirmationCode;
                            account.CodeGeneratedAt = DateTime.Now;
                            await UserManager.UpdateAsync(account);

                            string emailBody = $@"
                            Dear {account.Email},<br/>
                            Thank you for registering.<br/>
                            Your email confirmation code is: <strong>{confirmationCode}</strong><br/>
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
            //var account = await UserManager.FindByEmailAsync(loginDto.Email);

            var account = await UserManager.Users
                .Where(u => u.Email.ToLower() == loginDto.Email.ToLower() && !u.IsDeleted)
                .FirstOrDefaultAsync();

            if (account != null && !account.IsDeleted)
            {
                var isEmailConfirmed = await UserManager.IsEmailConfirmedAsync(account);
                if (!isEmailConfirmed)
                {
                    return Unauthorized(new { message = "Please confirm your email before logging in." });
                }

                var checkPasswordResult = await UserManager.CheckPasswordAsync(account, loginDto.Password);
                if (checkPasswordResult)
                {
                    var roles = await UserManager.GetRolesAsync(account);
                    //create token
                    var jwtToken = TokenService.CreateJWTToken(account, roles.ToList());

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
        public async Task<IActionResult> ConfirmEmailCode(string email, string code)
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

            // Optional: Expire the code after 10 minutes
            if (user.CodeGeneratedAt.HasValue && (DateTime.Now - user.CodeGeneratedAt.Value).TotalMinutes > 10)
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
                    account.CodeGeneratedAt = DateTime.Now;
                    await UserManager.UpdateAsync(account);

                    string emailBody = $@"
                            Dear {account.Email},<br/>
                            Thank you for registering.<br/>
                            Your email confirmation code is: <strong>{confirmationCode}</strong><br/>
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

            // Generate a 6-digit reset code
            var resetCode = new Random().Next(100000, 999999).ToString();

            // Store the reset code and timestamp
            user.PasswordResetCode = resetCode;
            user.ResetCodeGeneratedAt = DateTime.UtcNow;
            await UserManager.UpdateAsync(user);

            var emailBody = $@"
                    <p>Your password reset code is: <strong>{resetCode}</strong></p>
                    <p>This code will expire in 10 minutes.</p>";

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
                (DateTime.UtcNow - user.ResetCodeGeneratedAt.Value).TotalMinutes > 10)
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
            if (user.PasswordResetCode == null ||
                user.ResetCodeGeneratedAt == null ||
                (DateTime.UtcNow - user.ResetCodeGeneratedAt.Value).TotalMinutes > 10)
            {
                return BadRequest(new { message = "Reset code is invalid or expired." });
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



        //[HttpPost("external-login/google")]
        //public async Task<IActionResult> ExternalLoginWithGoogle([FromBody] ExternalLoginDto dto)
        //{
        //    try
        //    {
        //        var payload = await GoogleJsonWebSignature.ValidateAsync(dto.IdToken);

        //        var email = payload.Email;
        //        var name = payload.Name;

        //        var user = await UserManager.FindByEmailAsync(email);
        //        if (user == null)
        //        {
        //            user = new Account
        //            {
        //                UserName = email,
        //                Email = email,
        //                EmailConfirmed = true
        //            };

        //            var createResult = await UserManager.CreateAsync(user);
        //            if (!createResult.Succeeded)
        //            {
        //                return BadRequest(createResult.Errors);
        //            }

        //            //await UserManager.AddToRoleAsync(user, "Customer");

        //            // Optionally create related customer data here
        //        }

        //        var roles = await UserManager.GetRolesAsync(user);
        //        var jwtToken = TokenService.CreateJWTToken(user, roles.ToList());

        //        return Ok(new
        //        {
        //            token = jwtToken
        //        });
        //    }
        //    catch (InvalidJwtException)
        //    {
        //        return Unauthorized("Invalid Google token");
        //    }
        //}



    }
}
