using ClubSys.Domain.Entities;
using ClubSys.Features.Users.Events;
using ClubSys.Infastructure.Data;
using MediatR;
using Microsoft.Extensions.Caching.Memory;

namespace ClubSys.Features.Users.AdminUpdateUser
{
    /// <summary>
    /// Handler for administrative user updates.
    /// Allows updates to all profile fields including House and Email.
    /// </summary>
    public class AdminUpdateUserHandler : IRequestHandler<AdminUpdateUserCmd, AdminUpdateUserResponse>
    {
        private readonly ClubSysDbContext _dbContext;
        private readonly IMemoryCache _cache;
        private readonly IMediator _mediator;

        public AdminUpdateUserHandler(ClubSysDbContext dbContext, IMemoryCache cache, IMediator mediator)
        {
            _dbContext = dbContext;
            _cache = cache;
            _mediator = mediator;
        }

        public async Task<AdminUpdateUserResponse> Handle(AdminUpdateUserCmd request, CancellationToken cancellationToken)
        {
            var user = await _dbContext.Users.FindAsync(new object?[] { request.UserId }, cancellationToken);
            
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {request.UserId} not found.");
            }

            // Administrative override of all allowed profile fields.
            user.HouseId = request.HouseId;
            user.StudentId = request.StudentId;
            user.UserName = request.UserName;
            user.Email = request.Email;
            user.YrLevel = request.YrLevel;
            user.Course = request.Course;
            user.GlobalRole = request.GlobalRole;

            await _dbContext.SaveChangesAsync(cancellationToken);
            
            var updatedOn = DateTimeOffset.UtcNow;
            await _mediator.Publish(new UpdateUserNameEvent(user.Id, user.UserName, updatedOn), cancellationToken);

            // Remove cached list of users during administrative update.
            _cache.Remove("GetAllUsers");

            return new AdminUpdateUserResponse
            {
                UserId = user.Id,
                HouseId = user.HouseId,
                StudentId = user.StudentId,
                UserName = user.UserName,
                Email = user.Email,
                YrLevel = user.YrLevel,
                Course = user.Course,
                GlobalRole = user.GlobalRole,
                UpdatedOn = updatedOn
            };
        }
    }
}
