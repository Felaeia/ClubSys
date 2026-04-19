using MediatR;

namespace ClubSys.Features.Users.UpdateUser
{
    /// <summary>
    /// Command to update general user profile settings.
    /// Does not include sensitive data like House or Email, which are managed separately.
    /// </summary>
    /// <param name="UserId">The unique identifier of the user.</param>
    /// <param name="StudentId">The student's ID number.</param>
    /// <param name="UserName">The display name of the user.</param>
    /// <param name="YrLevel">The user's current year level.</param>
    /// <param name="Course">The student's enrolled course.</param>
    public record UpdateUserSettingsCmd(
        Guid UserId,
        string StudentId,
        string UserName,
        int YrLevel,
        string Course) : IRequest<UpdateUserSettingsResponse>;
}
