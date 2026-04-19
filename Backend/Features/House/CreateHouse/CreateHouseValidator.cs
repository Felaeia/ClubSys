using FluentValidation;

namespace ClubSys.Features.House.CreateHouse
{
    /// <summary>
    /// Validator for the CreateHouseCmd.
    /// Ensures valid house names and descriptions.
    /// </summary>
    public class CreateHouseValidator : AbstractValidator<CreateHouseCmd>
    {
        public CreateHouseValidator()
        {
            RuleFor(x => x.AdminId)
                .NotEmpty().WithMessage("Admin ID is required for authorization.");

            RuleFor(x => x.HouseName)
                .NotEmpty().WithMessage("House name is required.")
                .MaximumLength(100).WithMessage("House name cannot exceed 100 characters.");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Description is required.")
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.");
        }
    }
}
