using FluentValidation;

namespace ClubSys.Features.Users.UpdateUser
{
    public class UpdateUserNameValidator : AbstractValidator<UpdateUseNameCmd>
    {
        public UpdateUserNameValidator()
        {
            RuleFor(x => x.UserName)
                .NotEmpty().WithMessage("Last name is required.")
                .MaximumLength(50).WithMessage("Last name cannot exceed 50 characters.");
        }
    }
}
