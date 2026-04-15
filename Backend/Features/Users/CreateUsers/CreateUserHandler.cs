using ClubSys.Infastructure.Data;
using MediatR;
using ClubSys.Domain.Entities;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
using ClubSys.Features.Users.Events;

namespace ClubSys.Features.Users.CreateUsers
{
    public class CreateUserHandler : IRequestHandler<CreateUserCmd, CreateUserResponse>
    {
        private readonly ClubSysDbContext _dbContext;
        private readonly IMemoryCache _cache;
        private readonly IMediator _mediator;

        public CreateUserHandler(ClubSysDbContext dbContext, IMemoryCache cache, IMediator mediator)
        {
            _dbContext = dbContext;
            _cache = cache;
            _mediator = mediator;
        }

        public async Task<CreateUserResponse> Handle(CreateUserCmd request, CancellationToken cancellationToken)
        {
            using var hmac = new HMACSHA512();

            var user = new User
            {
                UserId = Guid.NewGuid(),
                StudentId = request.StudentId,
                UserName = request.UserName,
                Email = request.Email,
                PasswordSalt = hmac.Key,
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(request.Password)),
                GlobalRole = request.GlobalRole,
                CreatedOn = DateTime.UtcNow
            };
            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync(cancellationToken);
            await _mediator.Publish(new UserCreatedEvent(user.UserId, user.UserName, user.CreatedOn));

            // Remove cached list of users during Creation of new User.
            _cache.Remove("GetAllUsers");

            return new CreateUserResponse
            {
                UserId = user.UserId,
                StudentId = user.StudentId,
                UserName = user.UserName,
                Email = user.Email,
                GlobalRole = user.GlobalRole,
                CreatedOn = user.CreatedOn
            };
        }
    }
    
}
