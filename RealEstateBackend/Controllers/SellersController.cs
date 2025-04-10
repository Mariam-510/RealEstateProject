using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RealEstate.JWT;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.AccountDto;
using RealEstate.Models.Dtos.SellerDto;
using RealEstate.Repositories;
using System.Security.Claims;
using System.Transactions;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class SellersController : ControllerBase
    {
        public ISellerRepository SellerRepository { get; }
        public IMapper Mapper { get; }
        public UserManager<Account> UserManager { get; }
        public JWTService TokenService { get; }

        public SellersController(ISellerRepository sellerRepository, IMapper mapper,
            UserManager<Account> userManager, JWTService tokenService)
        {
            SellerRepository = sellerRepository;
            Mapper = mapper;
            UserManager = userManager;
            TokenService = tokenService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var sellers = await SellerRepository.GetAllAsync();

            var sellersDto = Mapper.Map<List<SellerDto>>(sellers);

            return Ok(sellersDto);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var seller = await SellerRepository.GetByIdAsync(id);

            if (seller == null)
            {
                return NotFound();
            }

            var sellerDto = Mapper.Map<SellerDto>(seller);

            return Ok(sellerDto);
        }

        [HttpGet]
        [Route("account/{accountId}")]
        public async Task<IActionResult> GetByAccountId([FromRoute] string accountId)
        {
            var seller = await SellerRepository.GetByAccountIdAsync(accountId);

            if (seller == null)
            {
                return NotFound();
            }

            var sellerDto = Mapper.Map<SellerDto>(seller);

            return Ok(sellerDto);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromBody] SellerFormDto sellerFormDto)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    if (!ModelState.IsValid)
                    {
                        return BadRequest(ModelState);
                    }

                    var seller = Mapper.Map<Seller>(sellerFormDto);

                    var updatedSeller = await SellerRepository.UpdateAsync(id, seller);
                    if (updatedSeller == null)
                    {
                        transactionScope.Dispose();
                        return NotFound(new { message = "Seller not found." });
                    }

                    var existingAccount = await UserManager.FindByIdAsync(updatedSeller.AccountId);
                    if (existingAccount == null)
                    {
                        transactionScope.Dispose();
                        return NotFound(new { message = "Associated account not found." });
                    }

                    // Password change validation
                    if (string.IsNullOrWhiteSpace(sellerFormDto.CurrentPassword) &&
                        !string.IsNullOrWhiteSpace(sellerFormDto.NewPassword))
                    {
                        transactionScope.Dispose();
                        return BadRequest(new { message = "You must enter your current password to set a new one." });
                    }

                    // Change password
                    if (!string.IsNullOrWhiteSpace(sellerFormDto.CurrentPassword) &&
                        !string.IsNullOrWhiteSpace(sellerFormDto.NewPassword))
                    {
                        bool isCurrentPasswordValid = await UserManager.CheckPasswordAsync(existingAccount, sellerFormDto.CurrentPassword);
                        if (!isCurrentPasswordValid)
                        {
                            transactionScope.Dispose();
                            return Unauthorized(new { message = "Current password is incorrect." });
                        }

                        var token = await UserManager.GeneratePasswordResetTokenAsync(existingAccount);
                        var passwordResult = await UserManager.ResetPasswordAsync(existingAccount, token, sellerFormDto.NewPassword);

                        if (!passwordResult.Succeeded)
                        {
                            transactionScope.Dispose();
                            return StatusCode(500, passwordResult.Errors);
                        }
                    }

                    var updateResult = await UserManager.UpdateAsync(existingAccount);
                    if (!updateResult.Succeeded)
                    {
                        transactionScope.Dispose();
                        return StatusCode(500, updateResult.Errors);
                    }


                    var roles = await UserManager.GetRolesAsync(existingAccount);
                    //create token
                    var jwtToken = TokenService.CreateJWTToken(existingAccount, roles.ToList());

                    var tokenDto = new JWTTokenDto()
                    {
                        JwtToken = jwtToken,
                    };

                    var sellerDto = Mapper.Map<SellerDto>(updatedSeller);

                    transactionScope.Complete();
                    return Ok(new { message = "Seller updated successfully.", tokenDto,  sellerDto});
                }
                catch (Exception)
                {
                    transactionScope.Dispose();
                    return StatusCode(500, new { message = "An unexpected error occurred." });
                }
            }
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    var deletedSeller = await SellerRepository.GetByIdAsync(id);
                    if (deletedSeller == null)
                    {
                        transactionScope.Dispose();
                        return NotFound(new { message = "Seller not found." });
                    }
                    else
                    {
                        var existingAccount = await UserManager.FindByIdAsync(deletedSeller.AccountId);
                        if (existingAccount == null)
                        {
                            transactionScope.Dispose();
                            return NotFound(new { message = "Associated account not found." });
                        }

                        existingAccount.IsDeleted = true;
                        existingAccount.UserName = Guid.NewGuid().ToString();
                        var updateResult = await UserManager.UpdateAsync(existingAccount);

                        //var deleteResult = await UserManager.DeleteAsync(deletedSeller.Account);

                        if (!updateResult.Succeeded)
                        {
                            transactionScope.Dispose();
                            return StatusCode(500, new { message = "Failed to delete associated account." });
                        }
                        else
                        {
                            deletedSeller = await SellerRepository.DeleteAsync(id);
                            if (deletedSeller == null)
                            {
                                transactionScope.Dispose();
                                return NotFound(new { message = "Seller deletion failed." });
                            }
                        }
                    }
                    transactionScope.Complete();
                    return Ok(new { message = "Seller deleted successfully." });
                }
                catch
                {
                    transactionScope.Dispose();
                    return StatusCode(500, new { message = "An error occurred while deleting the seller." });
                }
            }
        }

    }
}