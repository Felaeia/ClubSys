using ClubSys.Domain.Entities;
using MediatR;

namespace ClubSys.Features.Users.CreateUsers
{
    public record CreateUserCmd(string StudentId, string UserName, string Email, string Password, GlobalRole GlobalRole) :
        IRequest<CreateUserResponse>;
    
}
