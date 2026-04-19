using ClubSys.Infastructure.Data;
using MediatR;
using ClubSys.Domain.Entities;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Caching.Memory;
using ClubSys.Features.Users.Events;

namespace ClubSys.Features.Users.CreateUsers
{
    /// <summary>
    /// Handler for creating a new user with secure password hashing.
    /// </summary>
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
            // SECURITY: Using HMACSHA512 for strong password hashing and salting.
            using var hmac = new HMACSHA512();

            var user = new User
            {
                Id = Guid.NewGuid(),
                HouseId = request.HouseId,
                StudentId = request.StudentId,
                UserName = request.UserName,
                Email = request.Email,
                YrLevel = request.YrLevel,
                Course = request.Course,
                PasswordSalt = hmac.Key,
                PasswordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(request.Password)),
                GlobalRole = request.GlobalRole,
                CreatedOn = DateTimeOffset.UtcNow
            };

            _dbContext.Users.Add(user);
            await _dbContext.SaveChangesAsync(cancellationToken);
            
            // Publish domain event for new user creation.
            await _mediator.Publish(new UserCreatedEvent(user.Id, user.UserName, user.CreatedOn), cancellationToken);

            // Remove cached list of users to ensure data consistency.
            _cache.Remove("GetAllUsers");

            return new CreateUserResponse
            {
                UserId = user.Id,
                HouseId = user.HouseId,
                StudentId = user.StudentId,
                UserName = user.UserName,
                Email = user.Email,
                YrLevel = user.YrLevel,
                Course = user.Course,
                GlobalRole = user.GlobalRole,
                CreatedOn = user.CreatedOn
            };
        }
    }
}
