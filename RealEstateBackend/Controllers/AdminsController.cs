using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using RealEstate.JWT;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.AccountDto;
using RealEstate.Models.Dtos.AdminDto;
using RealEstate.Models.Dtos.EmailDto;
using RealEstate.Models.Dtos.JWTDto;
using RealEstate.Repositories;
using RealEstate.Services;
using System.Transactions;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminsController : ControllerBase
    {
        public IAdminRepository AdminRepository { get; }
        public IMapper Mapper { get; }
        public UserManager<Account> UserManager { get; }
        public JWTService TokenService { get; }
        public FileService FileService { get; }

        public AdminsController(IAdminRepository adminRepository, IMapper mapper,
            UserManager<Account> userManager, JWTService tokenService, FileService fileService)
        {
            AdminRepository = adminRepository;
            Mapper = mapper;
            UserManager = userManager;
            TokenService = tokenService;
            FileService = fileService;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var admins = await AdminRepository.GetAllAsync();

            var adminsDto = Mapper.Map<List<AdminDto>>(admins);

            return Ok(adminsDto);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var admin = await AdminRepository.GetByIdAsync(id);

            if (admin == null)
            {
                return NotFound();
            }

            var adminDto = Mapper.Map<AdminDto>(admin);

            return Ok(adminDto);
        }


        [HttpGet]
        [Route("account/{accountId}")]
        public async Task<IActionResult> GetByAccountId([FromRoute] string accountId)
        {
            var admin = await AdminRepository.GetByAccountIdAsync(accountId);

            if (admin == null)
            {
                return NotFound();
            }

            var adminDto = Mapper.Map<AdminDto>(admin);

            return Ok(adminDto);
        }


        [HttpPost]
        public async Task<IActionResult> Create([FromForm] CreateAdminDto createAdminDto)
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
                        .Where(u => u.Email.ToLower() == createAdminDto.Email.ToLower() && !u.IsDeleted)
                        .FirstOrDefaultAsync();

                    if (existingUser != null)
                    {
                        return BadRequest(new { message = "Email already exists." });
                    }

                    var account = Mapper.Map<Account>(createAdminDto);
                    account.CreatedAt = DateTime.Now;
                    account.UserName = createAdminDto.Email;
                    account.EmailConfirmationCode = null;
                    account.CodeGeneratedAt = null;
                    account.PasswordResetCode = null;
                    account.ResetCodeGeneratedAt = null;
                    account.EmailConfirmed = true;

                    var registerResult = await UserManager.CreateAsync(account, createAdminDto.Password);

                    if (registerResult.Succeeded)
                    {
                        account.ImageUrl = FileService.UploadFile("UserImages", createAdminDto.Image);
                        await UserManager.UpdateAsync(account);

                        registerResult = await UserManager.AddToRoleAsync(account, "Admin");

                        if (registerResult.Succeeded)
                        {
                            var admin = Mapper.Map<Admin>(createAdminDto);
                            admin.IsDeleted = false;
                            admin.AccountId = account.Id;

                            admin = await AdminRepository.CreateAsync(admin);

                            if (admin == null)
                                return StatusCode(500, new { message = "An error occurred while creating" });

                            transactionScope.Complete();
                            return Ok(new { message = "Created Successfully!" });

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


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] AdminFormDto adminFormDto)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    if (!ModelState.IsValid)
                    {
                        return BadRequest(ModelState);
                    }

                    var admin = Mapper.Map<Admin>(adminFormDto);

                    var updatedAdmin = await AdminRepository.UpdateAsync(id, admin);

                    if (updatedAdmin == null)
                    {
                        transactionScope.Dispose();
                        return NotFound(new { message = "Admin not found." });
                    }

                    var existingAccount = await UserManager.FindByIdAsync(updatedAdmin.AccountId);
                    if (existingAccount == null)
                    {
                        transactionScope.Dispose();
                        return NotFound(new { message = "Associated account not found." });
                    }

                    // Password change validation
                    if (string.IsNullOrWhiteSpace(adminFormDto.CurrentPassword) &&
                        !string.IsNullOrWhiteSpace(adminFormDto.NewPassword))
                    {
                        transactionScope.Dispose();
                        return BadRequest(new { message = "You must enter your current password to set a new one." });
                    }

                    // Change password
                    if (!string.IsNullOrWhiteSpace(adminFormDto.CurrentPassword) &&
                        !string.IsNullOrWhiteSpace(adminFormDto.NewPassword))
                    {
                        bool isCurrentPasswordValid = await UserManager.CheckPasswordAsync(existingAccount, adminFormDto.CurrentPassword);
                        if (!isCurrentPasswordValid)
                        {
                            transactionScope.Dispose();
                            return Unauthorized(new { message = "Current password is incorrect." });
                        }

                        var token = await UserManager.GeneratePasswordResetTokenAsync(existingAccount);
                        var passwordResult = await UserManager.ResetPasswordAsync(existingAccount, token, adminFormDto.NewPassword);

                        if (!passwordResult.Succeeded)
                        {
                            transactionScope.Dispose();
                            return StatusCode(500, passwordResult.Errors);
                        }
                    }

                    // Handle image - if no image was provided in the DTO, keep the existing one
                    if (adminFormDto.Image == null)
                    {
                        // No image was provided in the request
                        if (adminFormDto.RemoveImage) // Add a bool RemoveImage property to your DTO
                        {
                            // User explicitly wants to remove the image
                            FileService.DeleteFile(existingAccount.ImageUrl);
                            existingAccount.ImageUrl = null;
                        }
                    }
                    else
                    {
                        // New image was provided - handle the upload
                        existingAccount.ImageUrl = FileService.UpdateFile("UserImages", adminFormDto.Image, existingAccount.ImageUrl);
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
                        UserId = updatedAdmin.Id,
                        FirstName = updatedAdmin.Name
                    };

                    var jwtToken = TokenService.CreateJWTToken(existingAccount, roles.ToList(), userClaims);

                    var tokenDto = new JWTTokenDto()
                    {
                        JwtToken = jwtToken,
                    };

                    var adminDto = Mapper.Map<AdminDto>(updatedAdmin);

                    transactionScope.Complete();
                    return Ok(new { message = "Admin updated successfully.", tokenDto, adminDto });
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
                    var deletedAdmin = await AdminRepository.GetByIdAsync(id);
                    if (deletedAdmin == null)
                    {
                        transactionScope.Dispose();
                        return NotFound(new { message = "Admin not found." });
                    }
                    else
                    {
                        var existingAccount = await UserManager.FindByIdAsync(deletedAdmin.AccountId);
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
                            deletedAdmin = await AdminRepository.DeleteAsync(id);
                            if (deletedAdmin == null)
                            {
                                transactionScope.Dispose();
                                return NotFound(new { message = "Admin deletion failed." });
                            }
                        }
                    }
                    transactionScope.Complete();
                    return Ok(new { message = "Admin deleted successfully." });
                }
                catch
                {
                    transactionScope.Dispose();
                    return StatusCode(500, new { message = "An error occurred while deleting the admin." });
                }
            }
        }

    }
}