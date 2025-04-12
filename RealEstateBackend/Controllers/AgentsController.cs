using AutoMapper;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using RealEstate.JWT;
using RealEstate.Models.Domains;
using RealEstate.Models.Dtos.AccountDto;
using RealEstate.Models.Dtos.AgentDto;
using RealEstate.Models.Dtos.EmailDto;
using RealEstate.Models.Dtos.ShippingDto;
using RealEstate.Repositories;
using RealEstate.Services;
using System.Transactions;

namespace RealEstate.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AgentsController : ControllerBase
    {
        public IAgentRepository AgentRepository { get; }
        public IMapper Mapper { get; }
        public UserManager<Account> UserManager { get; }
        public JWTService TokenService { get; }
        public FileService FileService { get; }
        public EmailService EmailService { get; }

        public AgentsController(IAgentRepository agentRepository, IMapper mapper,
            UserManager<Account> userManager, JWTService tokenService, FileService fileService,
            EmailService emailService)
        {
            AgentRepository = agentRepository;
            Mapper = mapper;
            UserManager = userManager;
            TokenService = tokenService;
            FileService = fileService;
            EmailService = emailService;
        }


        [HttpGet]
        public async Task<IActionResult> GetAll([FromQuery] ApprovalStatus? approvalStatus)
        {
            var agents = await AgentRepository.GetAllAsync(approvalStatus);

            var agentsDto = Mapper.Map<List<AgentDto>>(agents);

            return Ok(agentsDto);
        }


        [HttpGet("{id}")]
        public async Task<IActionResult> GetById([FromRoute] int id)
        {
            var agent = await AgentRepository.GetByIdAsync(id);

            if (agent == null)
            {
                return NotFound();
            }

            var agentDto = Mapper.Map<AgentDto>(agent);

            return Ok(agentDto);
        }


        [HttpGet]
        [Route("account/{accountId}")]
        public async Task<IActionResult> GetByAccountId([FromRoute] string accountId)
        {
            var agent = await AgentRepository.GetByAccountIdAsync(accountId);

            if (agent == null)
            {
                return NotFound();
            }

            var agentDto = Mapper.Map<AgentDto>(agent);

            return Ok(agentDto);
        }


        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, [FromForm] AgentFormDto agentFormDto)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    if (!ModelState.IsValid)
                    {
                        return BadRequest(ModelState);
                    }

                    var agent = Mapper.Map<Agent>(agentFormDto);

                    var updatedAgent = await AgentRepository.UpdateAsync(id, agent);

                    if (updatedAgent == null)
                    {
                        transactionScope.Dispose();
                        return NotFound(new { message = "Agent not found." });
                    }

                    var existingAccount = await UserManager.FindByIdAsync(updatedAgent.AccountId);
                    if (existingAccount == null)
                    {
                        transactionScope.Dispose();
                        return NotFound(new { message = "Associated account not found." });
                    }

                    // Password change validation
                    if (string.IsNullOrWhiteSpace(agentFormDto.CurrentPassword) &&
                        !string.IsNullOrWhiteSpace(agentFormDto.NewPassword))
                    {
                        transactionScope.Dispose();
                        return BadRequest(new { message = "You must enter your current password to set a new one." });
                    }

                    // Change password
                    if (!string.IsNullOrWhiteSpace(agentFormDto.CurrentPassword) &&
                        !string.IsNullOrWhiteSpace(agentFormDto.NewPassword))
                    {
                        bool isCurrentPasswordValid = await UserManager.CheckPasswordAsync(existingAccount, agentFormDto.CurrentPassword);
                        if (!isCurrentPasswordValid)
                        {
                            transactionScope.Dispose();
                            return Unauthorized(new { message = "Current password is incorrect." });
                        }

                        var token = await UserManager.GeneratePasswordResetTokenAsync(existingAccount);
                        var passwordResult = await UserManager.ResetPasswordAsync(existingAccount, token, agentFormDto.NewPassword);

                        if (!passwordResult.Succeeded)
                        {
                            transactionScope.Dispose();
                            return StatusCode(500, passwordResult.Errors);
                        }
                    }

                    // Handle image - if no image was provided in the DTO, keep the existing one
                    if (agentFormDto.Image == null)
                    {
                        // No image was provided in the request
                        if (agentFormDto.RemoveImage) // Add a bool RemoveImage property to your DTO
                        {
                            // User explicitly wants to remove the image
                            FileService.DeleteFile(existingAccount.ImageUrl);
                            existingAccount.ImageUrl = null;
                        }
                    }
                    else
                    {
                        // New image was provided - handle the upload
                        existingAccount.ImageUrl = FileService.UpdateFile("UserImages", agentFormDto.Image, existingAccount.ImageUrl);
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

                    var agentDto = Mapper.Map<AgentDto>(updatedAgent);

                    transactionScope.Complete();
                    return Ok(new { message = "Agent updated successfully.", tokenDto, agentDto });
                }
                catch (Exception)
                {
                    transactionScope.Dispose();
                    return StatusCode(500, new { message = "An unexpected error occurred." });
                }
            }
        }


        [HttpPut]
        [Route("Approve/{id}")]
        public async Task<IActionResult> UpdateApprovalStatus(int id, [FromForm] ApproveAgentDto approveAgentDto)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var existingAgent = await AgentRepository.GetByIdAsync(id);

            if (existingAgent == null)
            {
                return NotFound();
            }

            ApprovalStatus approvalStatus = approveAgentDto.IsApproved ? ApprovalStatus.Approved : ApprovalStatus.Rejected;

            var agent = await AgentRepository.UpdateIsApprovedAsync(id, approvalStatus);

            if (agent == null)
            {
                return NotFound();
            }

            string emailBody = $@"
                Dear {agent.Name},<br/><br/>
                We are pleased to inform you that your agent account has been <strong>{(approveAgentDto.IsApproved ? "approved" : "rejected")}</strong>.<br/><br/>
                {(approveAgentDto.IsApproved
                                ? "You can now log in and start using your account."
                                : "Unfortunately, your application has been rejected at this time.")}<br/><br/>
                If you have any questions, feel free to contact us.<br/><br/>
                Best regards,<br/>
                Real Estate Team";


            EmailDto emailDto = new EmailDto
            {
                To = agent.Account.Email,
                Subject = "Agent Approval Status",
                Body = emailBody
            };

            bool isEmailSent = EmailService.SendEmail(emailDto);

            if (!isEmailSent)
            {
                return StatusCode(500, new { message = "Failed to send confirmation email. Please try again." });
            }

            var agentDto = Mapper.Map<AgentDto>(agent);

            return Ok(new { message = "Updated Successfully!", agentDto });
        }


        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            using (var transactionScope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
            {
                try
                {
                    var deletedAgent = await AgentRepository.GetByIdAsync(id);
                    if (deletedAgent == null)
                    {
                        transactionScope.Dispose();
                        return NotFound(new { message = "Agent not found." });
                    }
                    else
                    {
                        var existingAccount = await UserManager.FindByIdAsync(deletedAgent.AccountId);
                        if (existingAccount == null)
                        {
                            transactionScope.Dispose();
                            return NotFound(new { message = "Associated account not found." });
                        }

                        existingAccount.IsDeleted = true;
                        existingAccount.UserName = Guid.NewGuid().ToString();
                        var updateResult = await UserManager.UpdateAsync(existingAccount);

                        //var deleteResult = await UserManager.DeleteAsync(deletedAgent.Account);

                        if (!updateResult.Succeeded)
                        {
                            transactionScope.Dispose();
                            return StatusCode(500, new { message = "Failed to delete associated account." });
                        }
                        else
                        {
                            deletedAgent = await AgentRepository.DeleteAsync(id);
                            if (deletedAgent == null)
                            {
                                transactionScope.Dispose();
                                return NotFound(new { message = "Agent deletion failed." });
                            }
                        }
                    }
                    transactionScope.Complete();
                    return Ok(new { message = "Agent deleted successfully." });
                }
                catch
                {
                    transactionScope.Dispose();
                    return StatusCode(500, new { message = "An error occurred while deleting the agent." });
                }
            }
        }

    }
}