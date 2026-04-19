using ClubSys.Domain.Entities;
using ClubSys.Features.Users.CreateUsers;
using ClubSys.Features.Users.Events;
using ClubSys.Infastructure.Data;
using MediatR;
using Microsoft.Extensions.Caching.Memory;

namespace ClubSys.Features.Users.UpdateUser
{
    public class UpdateUserNameHandler : IRequestHandler<UpdateUseNameCmd, UpdateUserNameResponse>
    {
        private readonly ClubSysDbContext _dbContext;
        private readonly IMemoryCache _cache;
        private readonly IMediator _mediator;

        public UpdateUserNameHandler(ClubSysDbContext dbContext, IMemoryCache cache, IMediator mediator)
        {
            _dbContext = dbContext;
            _cache = cache;
            _mediator = mediator;
        }

        public async Task<UpdateUserNameResponse> Handle(UpdateUseNameCmd request, CancellationToken cacellationToken)
        {
            var user = await _dbContext.Users.FindAsync(new object?[] { request.UserId }, cacellationToken);
            
            if (user == null)
            {
                throw new KeyNotFoundException($"User with ID {request.UserId} not found.");
            }

            user.UserName = request.UserName;

            await _dbContext.SaveChangesAsync(cacellationToken);
            await _mediator.Publish(new UpdateUserNameEvent(user.Id, user.UserName, DateTimeOffset.UtcNow), cacellationToken);

            // Remove cached list of users during Update of User.
            _cache.Remove("GetAllUsers");

            return new UpdateUserNameResponse
            {
                UserId = user.Id,
                UserName = user.UserName,
                //UpdatedOn = DateTimeOffset.UtcNow
            };
        }
    }
}
