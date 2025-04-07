using Microsoft.AspNetCore.Identity;

namespace RealEstate.Models.Attributes
{
    public class PasswordLengthValidator<TUser> : IPasswordValidator<TUser> where TUser : class
    {
        public Task<IdentityResult> ValidateAsync(UserManager<TUser> manager, TUser user, string password)
        {
            if (password.Length < 8 || password.Length > 10)  // Ensure length is between 8 and 10
            {
                return Task.FromResult(IdentityResult.Failed(new IdentityError
                {
                    Code = "PasswordLength",
                    Description = "Password must be between 8 and 10 characters long."
                }));
            }

            return Task.FromResult(IdentityResult.Success);
        }
    }

}
