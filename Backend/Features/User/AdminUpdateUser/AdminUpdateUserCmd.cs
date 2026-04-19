using ClubSys.Domain.Enums;
using MediatR;

namespace ClubSys.Features.Users.AdminUpdateUser
{
    /// <summary>
    /// Administrative command to update any field of a user profile.
    /// This command is intended for users with administrative privileges.
    /// </summary>
    public record AdminUpdateUserCmd(
        Guid UserId,
        Guid HouseId,
        string StudentId,
        string UserName,
        string Email,
        int YrLevel,
        string Course,
        GlobalRole GlobalRole) : IRequest<AdminUpdateUserResponse>;
}
