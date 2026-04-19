using MediatR;

namespace ClubSys.Features.Users.UpdateUserSettingSecurity
{
    /// <summary>
    /// Command to update a user's security settings (Email and Password).
    /// </summary>
    /// <param name="UserId">The unique identifier of the user.</param>
    /// <param name="CurrentPassword">The user's current password, required to authorize an email change.</param>
    /// <param name="NewEmail">The new email address for the user (optional).</param>
    /// <param name="NewPassword">The new password for the user (optional).</param>
    /// <param name="ConfirmNewPassword">Confirmation of the new password.</param>
    public record UpdateUserSettingSecurityCmd(
        Guid UserId,
        string CurrentPassword,
        string? NewEmail = null,
        string? NewPassword = null,
        string? ConfirmNewPassword = null) : IRequest<UpdateUserSettingSecurityResponse>;
}
