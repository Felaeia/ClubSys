using FluentValidation;

namespace ClubSys.Features.Users.UpdateUser
{
    /// <summary>
    /// Validator for general user profile updates.
    /// Excludes validation for House or Email as they are managed via other processes.
    /// </summary>
    public class UpdateUserSettingsValidator : AbstractValidator<UpdateUserSettingsCmd>
    {
        public UpdateUserSettingsValidator()
        {
            RuleFor(x => x.UserId)
                .NotEmpty().WithMessage("User ID is required.");

            RuleFor(x => x.StudentId)
                .NotEmpty().WithMessage("Student ID is required.")
                .MaximumLength(50).WithMessage("Student ID cannot exceed 50 characters.");

            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("User name is required.")
                .MaximumLength(50).WithMessage("User name cannot exceed 50 characters.");

            RuleFor(x => x.YrLevel)
                .InclusiveBetween(1, 10).WithMessage("Year level must be between 1 and 10.");

            RuleFor(x => x.Course)
                .NotEmpty().WithMessage("Course is required.")
                .MaximumLength(100).WithMessage("Course cannot exceed 100 characters.");
        }
    }
}
