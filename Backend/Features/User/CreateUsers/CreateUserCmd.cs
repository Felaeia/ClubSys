using ClubSys.Domain.Enums;
using MediatR;

namespace ClubSys.Features.Users.CreateUsers
{
    /// <summary>
    /// Command to create a new user.
    /// </summary>
    public record CreateUserCmd(
        Guid HouseId,
        string StudentId, 
        string UserName, 
        string Email, 
        int YrLevel,
        string Course,
        string Password, 
        string ConfirmPassword,
        GlobalRole GlobalRole) : IRequest<CreateUserResponse>;
}
