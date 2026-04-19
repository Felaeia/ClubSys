using FluentValidation;

namespace ClubSys.Features.House.DeleteHouse
{
    /// <summary>
    /// Validator for the DeleteHouseCmd.
    /// Ensures valid input for deleting a house.
    /// </summary>
    public class DeleteHouseValidator : AbstractValidator<DeleteHouseCmd>
    {
        public DeleteHouseValidator()
        {
            RuleFor(x => x.AdminId)
                .NotEmpty().WithMessage("Admin ID is required for authorization.");

            RuleFor(x => x.HouseId)
                .NotEmpty().WithMessage("House ID is required.");
        }
    }
}
