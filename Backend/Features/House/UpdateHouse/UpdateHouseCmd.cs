using MediatR;

namespace ClubSys.Features.House.UpdateHouse
{
    /// <summary>
    /// Command to update an existing house.
    /// Requires an administrative user ID for authorization.
    /// </summary>
    /// <param name="AdminId">The unique identifier of the user updating the house (must be an admin).</param>
    /// <param name="HouseId">The unique identifier of the house to be updated.</param>
    /// <param name="HouseName">The new name for the house.</param>
    /// <param name="Description">The new description for the house.</param>
    public record UpdateHouseCmd(
        Guid AdminId,
        Guid HouseId,
        string HouseName,
        string Description) : IRequest<UpdateHouseResponse>;
}
