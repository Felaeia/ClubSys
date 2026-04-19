using ClubSys.Domain.Entities;
using ClubSys.Infastructure.Data;
using MediatR;
using Microsoft.Extensions.Caching.Memory;
using System.Security.Cryptography;
using System.Text;

namespace ClubSys.Features.Users.UpdateUserSettingSecurity
{
    /// <summary>
    /// Handler for updating a user's security settings (Email and Password).
    /// Implements password verification using HMACSHA512 for secure updates.
    /// </summary>
    public class UpdateUserSettingSecurityHandler : IRequestHandler<UpdateUserSettingSecurityCmd, UpdateUserSettingSecurityResponse>
    {
        private readonly ClubSysDbContext _dbContext;
        private readonly IMemoryCache _cache;

        public UpdateUserSettingSecurityHandler(ClubSysDbContext dbContext, IMemoryCache cache)
        {
            _dbContext = dbContext;
            _cache = cache;
        }

        public async Task<UpdateUserSettingSecurityResponse> Handle(UpdateUserSettingSecurityCmd request, CancellationToken cancellationToken)
        {
            // Retrieve the user from the database.
            var user = await _dbContext.Users.FindAsync(new object?[] { request.UserId }, cancellationToken);

            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {request.UserId} not found.");
            }

            // SECURITY: Verify the user's current password before allowing any security modifications.
            // This prevents unauthorized users from changing security settings if a session is compromised.
            if (!VerifyPasswordHash(request.CurrentPassword, user.PasswordHash, user.PasswordSalt))
            {
                // In a real application, you might want to return a specific result object or throw a custom exception
                // that is handled by middleware to return a 401 Unauthorized or 400 Bad Request.
                throw new UnauthorizedAccessException("Unauthorized: Invalid current password provided for security update.");
            }

            bool emailUpdated = false;
            bool passwordUpdated = false;

            // Update Email if a new one is provided and differs from the current one.
            if (!string.IsNullOrEmpty(request.NewEmail) && user.Email != request.NewEmail)
            {
                user.Email = request.NewEmail;
                emailUpdated = true;
            }

            // Update Password if a new one is provided.
            if (!string.IsNullOrEmpty(request.NewPassword))
            {
                CreatePasswordHash(request.NewPassword, out byte[] passwordHash, out byte[] passwordSalt);
                user.PasswordHash = passwordHash;
                user.PasswordSalt = passwordSalt;
                passwordUpdated = true;
            }

            // If any security settings were changed, persist the changes and clear relevant caches.
            if (emailUpdated || passwordUpdated)
            {
                await _dbContext.SaveChangesAsync(cancellationToken);
                
                // Remove cached list of users to ensure data consistency across the application.
                _cache.Remove("GetAllUsers");
            }

            return new UpdateUserSettingSecurityResponse
            {
                UserId = user.Id,
                IsEmailUpdated = emailUpdated,
                IsPasswordUpdated = passwordUpdated,
                Message = (emailUpdated || passwordUpdated) ? "Security settings updated successfully." : "No changes were made.",
                UpdatedOn = DateTimeOffset.UtcNow
            };
        }

        /// <summary>
        /// Verifies a plain-text password against a stored hash and salt.
        /// </summary>
        private bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
        {
            using var hmac = new HMACSHA512(storedSalt);
            var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            return computedHash.SequenceEqual(storedHash);
        }

        /// <summary>
        /// Generates a new HMACSHA512 hash and salt for a plain-text password.
        /// </summary>
        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using var hmac = new HMACSHA512();
            passwordSalt = hmac.Key;
            passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
        }
    }
}
