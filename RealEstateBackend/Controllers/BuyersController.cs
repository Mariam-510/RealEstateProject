using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RealEstate.JWT;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.AccountDto;
using RealEstate.Models.Dtos.AgentDto;
using RealEstate.Models.Dtos.BuyerDto;
using RealEstate.Models.Dtos.JWTDto;
using RealEstate.Repositories;
using RealEstate.Services;
using System.Transactions;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class BuyersController : ControllerBase
    {
        public IBuyerRepository BuyerRepository { get; }
        public IMapper Mapper { get; }
        public UserManager<Account> UserManager { get; }
        public JWTService TokenService { get; }
        public FileService FileService { get; }

        public BuyersController(IBuyerRepository buyerRepository, IMapper mapper,
            UserManager<Account> userManager, JWTService tokenService, FileService fileService)
        {
            BuyerRepository = buyerRepository;
            Mapper = mapper;
            UserManager = userManager;
            TokenService = tokenService;
            FileService = fileService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var buyers = await BuyerRepository.GetAllAsync();

            var buyersDto = Mapper.Map<List<BuyerDto>>(buyers);

            return Ok(buyersDto);
        }

        [HttpGet("Id")]
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> GetById()
        {
            string buyerIdStr = User.FindFirst("userId")?.Value;

            if (!int.TryParse(buyerIdStr, out int buyerId))
            {
                return Unauthorized("Buyer not found.");
            }

            var buyer = await BuyerRepository.GetByIdAsync(buyerId);

            if (buyer == null)
            {
                return NotFound();
            }

            var buyerDto = Mapper.Map<BuyerDto>(buyer);

            return Ok(buyerDto);
        }
        [HttpGet("{buyerId}")]
        [Authorize(Roles = "Buyer,Admin")]
        public async Task<IActionResult> GetBuyerById(int buyerId)
        {
            var buyer = await BuyerRepository.GetByIdAsync(buyerId);

            if (buyer == null)
            {
                return NotFound();
            }

            var buyerDto = Mapper.Map<BuyerDto>(buyer);

            return Ok(buyerDto);
        }

        [HttpGet]
        [Route("account/{accountId}")]
        public async Task<IActionResult> GetByAccountId([FromRoute] string accountId)
        {
            var buyer = await BuyerRepository.GetByAccountIdAsync(accountId);

            if (buyer == null)
            {
                return NotFound();
            }

            var buyerDto = Mapper.Map<BuyerDto>(buyer);

            return Ok(buyerDto);
        }

        [HttpPut]
        [Authorize(Roles = "Buyer")]
        public async Task<IActionResult> Update([FromForm] BuyerFormDto buyerFormDto)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    if (!ModelState.IsValid)
                    {
                        return BadRequest(ModelState);
                    }

                    string buyerIdStr = User.FindFirst("userId")?.Value;

                    if (!int.TryParse(buyerIdStr, out int buyerId))
                    {
                        return Unauthorized("Buyer not found.");
                    }

                    var buyer = Mapper.Map<Buyer>(buyerFormDto);

                    var updatedBuyer = await BuyerRepository.UpdateAsync(buyerId, buyer);
                    if (updatedBuyer == null)
                    {
                        transactionScope.Dispose();
                        return NotFound(new { message = "Buyer not found." });
                    }

                    var existingAccount = await UserManager.FindByIdAsync(updatedBuyer.AccountId);
                    if (existingAccount == null)
                    {
                        transactionScope.Dispose();
                        return NotFound(new { message = "Associated account not found." });
                    }

                    // Password change validation
                    if (string.IsNullOrWhiteSpace(buyerFormDto.CurrentPassword) &&
                        !string.IsNullOrWhiteSpace(buyerFormDto.NewPassword))
                    {
                        transactionScope.Dispose();
                        return BadRequest(new { message = "You must enter your current password to set a new one." });
                    }

                    // Change password
                    if (!string.IsNullOrWhiteSpace(buyerFormDto.CurrentPassword) &&
                        !string.IsNullOrWhiteSpace(buyerFormDto.NewPassword))
                    {
                        bool isCurrentPasswordValid = await UserManager.CheckPasswordAsync(existingAccount, buyerFormDto.CurrentPassword);
                        if (!isCurrentPasswordValid)
                        {
                            transactionScope.Dispose();
                            return StatusCode(403,new { message = "Current password is incorrect." });
                        }

                        var token = await UserManager.GeneratePasswordResetTokenAsync(existingAccount);
                        var passwordResult = await UserManager.ResetPasswordAsync(existingAccount, token, buyerFormDto.NewPassword);

                        if (!passwordResult.Succeeded)
                        {
                            transactionScope.Dispose();
                            return StatusCode(500, passwordResult.Errors);
                        }
                    }

                    // Handle image - if no image was provided in the DTO, keep the existing one
                    if (buyerFormDto.Image == null)
                    {
                        // No image was provided in the request
                        if (buyerFormDto.RemoveImage) // Add a bool RemoveImage property to your DTO
                        {
                            // User explicitly wants to remove the image
                            FileService.DeleteFile(existingAccount.ImageUrl);
                            existingAccount.ImageUrl = null;
                        }
                    }
                    else
                    {
                        // New image was provided - handle the upload
                        existingAccount.ImageUrl = FileService.UpdateFile("UserImages", buyerFormDto.Image, existingAccount.ImageUrl);
                    }

                    var updateResult = await UserManager.UpdateAsync(existingAccount);
                    if (!updateResult.Succeeded)
                    {
                        transactionScope.Dispose();
                        return StatusCode(500, updateResult.Errors);
                    }


                    //create token
                    var roles = await UserManager.GetRolesAsync(existingAccount);

                    var userClaims = new UserClaimsDto
                    {
                        UserId = updatedBuyer.Id,
                        FirstName = updatedBuyer.FirstName,
                        LastName = updatedBuyer.LastName,
                        ImageUrl = existingAccount.ImageUrl
                    };

                    var jwtToken = TokenService.CreateJWTToken(existingAccount, roles.ToList(), userClaims);

                    var tokenDto = new JWTTokenDto()
                    {
                        JwtToken = jwtToken,
                    };

                    var buyerDto = Mapper.Map<BuyerDto>(updatedBuyer);

                    transactionScope.Complete();
                    return Ok(new { message = "Buyer updated successfully.", tokenDto, buyerDto });
                }
                catch (Exception)
                {
                    transactionScope.Dispose();
                    return StatusCode(500, new { message = "An unexpected error occurred." });
                }
            }
        }


        [HttpDelete]
        public async Task<IActionResult> Delete()
        {
            using (var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    string buyerIdStr = User.FindFirst("userId")?.Value;

                    if (!int.TryParse(buyerIdStr, out int buyerId))
                    {
                        return Unauthorized("Buyer not found.");
                    }

                    var deletedBuyer = await BuyerRepository.GetByIdAsync(buyerId);
                    if (deletedBuyer == null)
                    {
                        transactionScope.Dispose();
                        return NotFound(new { message = "Buyer not found." });
                    }
                    else
                    {
                        //var deleteResult = await UserManager.DeleteAsync(deletedBuyer.Account);

                        var existingAccount = await UserManager.FindByIdAsync(deletedBuyer.AccountId);
                        if (existingAccount == null)
                        {
                            transactionScope.Dispose();
                            return NotFound(new { message = "Associated account not found." });
                        }

                        existingAccount.IsDeleted = true;
                        existingAccount.UserName = Guid.NewGuid().ToString();
                        var updateResult = await UserManager.UpdateAsync(existingAccount);

                        if (!updateResult.Succeeded)
                        {
                            transactionScope.Dispose();
                            return StatusCode(500, new { message = "Failed to delete associated account." });
                        }
                        else
                        {
                            deletedBuyer = await BuyerRepository.DeleteAsync(buyerId);
                            if (deletedBuyer == null)
                            {
                                transactionScope.Dispose();
                                return NotFound(new { message = "Buyer deletion failed." });
                            }
                        }
                    }
                    transactionScope.Complete();
                    return Ok(new { message = "Buyer deleted successfully." });
                }
                catch (Exception e)
                {
                    transactionScope.Dispose();
                    return StatusCode(500, new { message = "An error occurred while deleting the Buyer." });
                }
            }
        }

    }
}