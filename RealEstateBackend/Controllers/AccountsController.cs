using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.WebUtilities;
using RealEstate.JWT;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.AccountDto;
using RealEstate.Models.Dtos.EmailDto;
using RealEstate.Repositories;
using RealEstate.Services;
using System.Text;
using System.Transactions;

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

        public AccountsController(UserManager<Account> userManager, JWTService tokenService, IMapper Mapper, EmailService emailService,
            IBuyerRepository buyerRepository, ISellerRepository sellerRepository)
        {
            UserManager = userManager;
            TokenService = tokenService;
            this.Mapper = Mapper;
            EmailService = emailService;
            BuyerRepository = buyerRepository;
            SellerRepository = sellerRepository;
        }

        //[HttpPost]
        //public async Task<IActionResult> Register([FromBody] RegisterSellerOrBuyerDto registerSellerOrBuyerDto)
        //{
        //    //var account = Mapper.Map<Account>(registerSellerOrBuyerDto);
        //    //var model = Mapper.Map<Seller>(registerSellerOrBuyerDto);

        //    //return Ok(model);
        //}

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

                    var existingUser = await UserManager.FindByEmailAsync(registerSellerOrBuyerDto.Email);
                    if (existingUser != null)
                    {
                        return BadRequest(new { message = "Email already exists." });
                    }

                    var account = Mapper.Map<Account>(registerSellerOrBuyerDto);
                    account.CteatedAt = DateTime.UtcNow;
                    account.UserName = registerSellerOrBuyerDto.Email;

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

                        var token = await UserManager.GenerateEmailConfirmationTokenAsync(account);

                        // Encode the token before using it in the URL
                        var encodedToken = WebEncoders.Base64UrlEncode(Encoding.UTF8.GetBytes(token));

                        string confirmationLink = Url.Action(
                            "ConfirmEmail",
                            "Account",
                            new { token = encodedToken, email = account.Email },
                            protocol: Request.Scheme
                        );

                        string emailBody = $@"
                                    Dear {account.Email},<br/>
                                    Thank you for your registration.<br/>
                                    Please click on the below link to complete your registration:<br/>
                                    <a href='{confirmationLink}'>Confirm Email</a>";

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


        [HttpGet("ConfirmEmail")]
        public async Task<IActionResult> ConfirmEmail(string token, string email)
        {
            if (string.IsNullOrWhiteSpace(token) || string.IsNullOrWhiteSpace(email))
                return BadRequest(new { message = "Invalid token or email." });

            var user = await UserManager.FindByEmailAsync(email);
            if (user == null)
                return NotFound(new { message = "User not found." });

            // Decode the token
            var decodedToken = Encoding.UTF8.GetString(WebEncoders.Base64UrlDecode(token));

            var result = await UserManager.ConfirmEmailAsync(user, decodedToken);
            if (result.Succeeded)
            {
                return Ok(new { message = "Email confirmed successfully!" });
            }

            return StatusCode(500, new { message = "Email confirmation failed.", errors = result.Errors });
        }


        //[HttpPost]
        //[Route("Login")]
        //public async Task<IActionResult> Login([FromBody] LoginDto loginDto)
        //{
        //    if (!ModelState.IsValid)
        //    {
        //        return BadRequest(ModelState);
        //    }
        //    var instructor = await UserManager.FindByNameAsync(loginDto.UserName);
        //    if (instructor != null)
        //    {
        //        var checkPasswordResult = await UserManager.CheckPasswordAsync(instructor, loginDto.Password);
        //        if (checkPasswordResult)
        //        {
        //            var roles = await UserManager.GetRolesAsync(instructor);
        //            //create token
        //            var jwtToken = TokenService.CreateJWTToken(instructor, roles.ToList());

        //            var tokenDto = new JWTTokenDto()
        //            {
        //                JwtToken = jwtToken,
        //            };

        //            return Ok(tokenDto);
        //        }
        //    }
        //    return Unauthorized(new { message = "UserName or Password Incorrect" });
        //}

    }
}
