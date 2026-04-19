using ClubSys.Domain.Enums;
using ClubSys.Infastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClubSys.Features.House.UpdateHouse
{
    /// <summary>
    /// Handler for updating an existing house.
    /// Verifies that the requester is an administrative user.
    /// </summary>
    public class UpdateHouseHandler : IRequestHandler<UpdateHouseCmd, UpdateHouseResponse>
    {
        private readonly ClubSysDbContext _dbContext;

        public UpdateHouseHandler(ClubSysDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<UpdateHouseResponse> Handle(UpdateHouseCmd request, CancellationToken cancellationToken)
        {
            // SECURITY: Verify that the user performing the action exists and is an Admin.
            var adminUser = await _dbContext.Users
                .FirstOrDefaultAsync(u => u.Id == request.AdminId, cancellationToken);

            if (adminUser == null)
            {
                throw new KeyNotFoundException($"Admin user with ID {request.AdminId} not found.");
            }

            if (adminUser.GlobalRole != GlobalRole.Admin)
            {
                throw new UnauthorizedAccessException("Unauthorized: Only administrators are permitted to update houses.");
            }

            // Retrieve the house to be updated.
            var house = await _dbContext.Houses
                .FirstOrDefaultAsync(h => h.Id == request.HouseId, cancellationToken);

            if (house == null || house.IsDeleted)
            {
                throw new KeyNotFoundException($"House with ID {request.HouseId} not found or has been deleted.");
            }

            // Update the house properties.
            house.HouseName = request.HouseName;
            house.Description = request.Description;

            await _dbContext.SaveChangesAsync(cancellationToken);

            return new UpdateHouseResponse
            {
                HouseId = house.Id,
                HouseName = house.HouseName,
                Description = house.Description,
                UpdatedOn = DateTimeOffset.UtcNow
            };
        }
    }
}
