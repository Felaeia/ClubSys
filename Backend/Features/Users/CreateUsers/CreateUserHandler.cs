using ClubSys.Infastructure.Data;
using MediatR;
using ClubSys.Domain.Entities;
using System.Security.Cryptography;
using System.Text;

namespace ClubSys.Features.Users.CreateUsers
{
    public class CreateUserHandler : IRequestHandler<CreateUserCmd, CreateUserResponse>
    {
        private readonly ClubSysDbContext _dbContext;

        public CreateUserHandler(ClubSysDbContext dbContext)
        {
            _dbContext = dbContext;
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
