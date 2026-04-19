using ClubSys.Domain.Entities;
using ClubSys.Features.Users.Events;
using ClubSys.Infastructure.Data;
using MediatR;
using Microsoft.Extensions.Caching.Memory;

namespace ClubSys.Features.Users.UpdateUser
{
    /// <summary>
    /// Handler for updating general user profile settings.
    /// Excludes sensitive or administrative data like House or Email.
    /// </summary>
    public class UpdateUserSettingsHandler : IRequestHandler<UpdateUserSettingsCmd, UpdateUserSettingsResponse>
    {
        private readonly ClubSysDbContext _dbContext;
        private readonly IMemoryCache _cache;
        private readonly IMediator _mediator;

        public UpdateUserSettingsHandler(ClubSysDbContext dbContext, IMemoryCache cache, IMediator mediator)
        {
            _dbContext = dbContext;
            _cache = cache;
            _mediator = mediator;
        }

        public async Task<UpdateUserSettingsResponse> Handle(UpdateUserSettingsCmd request, CancellationToken cancellationToken)
        {
            var user = await _dbContext.Users.FindAsync(new object?[] { request.UserId }, cancellationToken);
            
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {request.UserId} not found.");
            }

            // Update allowed general profile fields.
            user.StudentId = request.StudentId;
            user.UserName = request.UserName;
            user.YrLevel = request.YrLevel;
            user.Course = request.Course;

            await _dbContext.SaveChangesAsync(cancellationToken);
            
            var updatedOn = DateTimeOffset.UtcNow;
            await _mediator.Publish(new UpdateUserNameEvent(user.Id, user.UserName, updatedOn), cancellationToken);

            // Remove cached list of users during update.
            _cache.Remove("GetAllUsers");

            return new UpdateUserSettingsResponse
            {
                UserId = user.Id,
                StudentId = user.StudentId,
                UserName = user.UserName,
                YrLevel = user.YrLevel,
                Course = user.Course,
                UpdatedOn = updatedOn
            };
        }
    }
}
