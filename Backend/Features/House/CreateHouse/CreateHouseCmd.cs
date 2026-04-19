using MediatR;

namespace ClubSys.Features.House.CreateHouse
{
    /// <summary>
    /// Command to create a new house.
    /// Requires an administrative user ID for authorization.
    /// </summary>
    /// <param name="AdminId">The unique identifier of the user creating the house (must be an admin).</param>
    /// <param name="HouseName">The name of the new house.</param>
    /// <param name="Description">A brief description of the house.</param>
    public record CreateHouseCmd(
        Guid AdminId,
        string HouseName,
        string Description) : IRequest<CreateHouseResponse>;
}
