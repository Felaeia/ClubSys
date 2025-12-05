using ClubSys.Domain.Entities;
using MediatR;

namespace ClubSys.Features.Users.CreateUsers
{
    public record CreateUserCmd(string StudentId, string UserName, string Email, GlobalRole GlobalRole, string Password) :
        IRequest<CreateUserResponse>;
    
}
