using FluentValidation;

namespace ClubSys.Features.House.UpdateHouse
{
    /// <summary>
    /// Validator for the UpdateHouseCmd.
    /// Ensures valid input for updating a house.
    /// </summary>
    public class UpdateHouseValidator : AbstractValidator<UpdateHouseCmd>
    {
        public UpdateHouseValidator()
        {
            RuleFor(x => x.AdminId)
                .NotEmpty().WithMessage("Admin ID is required for authorization.");

            RuleFor(x => x.HouseId)
                .NotEmpty().WithMessage("House ID is required.");

            RuleFor(x => x.HouseName)
                .NotEmpty().WithMessage("House name is required.")
                .MaximumLength(100).WithMessage("House name cannot exceed 100 characters.");

            RuleFor(x => x.Description)
                .NotEmpty().WithMessage("Description is required.")
                .MaximumLength(500).WithMessage("Description cannot exceed 500 characters.");
        }
    }
}
