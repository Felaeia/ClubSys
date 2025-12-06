using ClubSys.Infastructure.Data;
using MediatR;
using ClubSys.Domain.Entities;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Caching.Memory;

namespace ClubSys.Features.Users.CreateUsers
{
    public class CreateUserHandler : IRequestHandler<CreateUserCmd, CreateUserResponse>
    {
        private readonly ClubSysDbContext _dbContext;
        private readonly IMemoryCache _cache;

        public CreateUserHandler(ClubSysDbContext dbContext, IMemoryCache cache)
        {
            _dbContext = dbContext;
            _cache = cache;
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
