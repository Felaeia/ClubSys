using MediatR;

namespace ClubSys.Features.House.DeleteHouse
{
    /// <summary>
    /// Command to soft-delete a house.
    /// Requires an administrative user ID for authorization.
    /// </summary>
    /// <param name="AdminId">The unique identifier of the user deleting the house (must be an admin).</param>
    /// <param name="HouseId">The unique identifier of the house to be deleted.</param>
    public record DeleteHouseCmd(
        Guid AdminId,
        Guid HouseId) : IRequest<DeleteHouseResponse>;
}
