using FluentValidation;

namespace ClubSys.Features.Users.AdminUpdateUser
{
    /// <summary>
    /// Validator for administrative user updates.
    /// Includes validation for all sensitive fields that admins are allowed to modify.
    /// </summary>
    public class AdminUpdateUserValidator : AbstractValidator<AdminUpdateUserCmd>
    {
        public AdminUpdateUserValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("User ID is required.");

            RuleFor(x => x.HouseId)
                .NotEmpty().WithMessage("House ID is required.");

            RuleFor(x => x.StudentId)
                .NotEmpty().WithMessage("Student ID is required.")
                .MaximumLength(50).WithMessage("Student ID cannot exceed 50 characters.");

            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("User name is required.")
                .MaximumLength(50).WithMessage("User name cannot exceed 50 characters.");

            RuleFor(x => x.Email)
                .NotEmpty().WithMessage("Email is required.")
                .EmailAddress().WithMessage("A valid email address is required.");

            RuleFor(x => x.YrLevel)
                .InclusiveBetween(1, 10).WithMessage("Year level must be between 1 and 10.");

            RuleFor(x => x.Course)
                .NotEmpty().WithMessage("Course is required.")
                .MaximumLength(100).WithMessage("Course cannot exceed 100 characters.");

            RuleFor(x => x.GlobalRole)
                .IsInEnum().WithMessage("Global role must be a valid value.");
        }
    }
}
