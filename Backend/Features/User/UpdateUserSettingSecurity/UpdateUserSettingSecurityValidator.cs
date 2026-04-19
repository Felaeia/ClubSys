using FluentValidation;

namespace ClubSys.Features.Users.UpdateUserSettingSecurity
{
    /// <summary>
    /// Validator for the UpdateUserSettingSecurityCmd.
    /// Implements security standards for password updates and email validation.
    /// </summary>
    public class UpdateUserSettingSecurityValidator : AbstractValidator<UpdateUserSettingSecurityCmd>
    {
        public UpdateUserSettingSecurityValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("User ID is required.");

            RuleFor(x => x.CurrentPassword)
                .NotEmpty().WithMessage("Current password is required to authorize security changes.");

            // Email validation (if provided)
            When(x => !string.IsNullOrEmpty(x.NewEmail), () =>
            {
                RuleFor(x => x.NewEmail)
                    .EmailAddress().WithMessage("A valid email address is required.");
            });

            // Password complexity validation (if provided)
            When(x => !string.IsNullOrEmpty(x.NewPassword), () =>
            {
                RuleFor(x => x.NewPassword)
                    .MinimumLength(8).WithMessage("New password must be at least 8 characters long.")
                    .Matches(@"[A-Z]").WithMessage("New password must contain at least one uppercase letter.")
                    .Matches(@"[a-z]").WithMessage("New password must contain at least one lowercase letter.")
                    .Matches(@"[0-9]").WithMessage("New password must contain at least one number.")
                    .Matches(@"[^a-zA-Z0-9]").WithMessage("New password must contain at least one special character.");

                RuleFor(x => x.ConfirmNewPassword)
                    .NotEmpty().WithMessage("Please confirm your new password.")
                    .Equal(x => x.NewPassword).WithMessage("The new password and confirmation password do not match.");
            });
        }
    }
}
