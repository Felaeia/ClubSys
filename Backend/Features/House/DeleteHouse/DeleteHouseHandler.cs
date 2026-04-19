using ClubSys.Domain.Enums;
using ClubSys.Infastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClubSys.Features.House.DeleteHouse
{
    /// <summary>
    /// Handler for soft-deleting an existing house.
    /// Verifies that the requester is an administrative user.
    /// </summary>
    public class DeleteHouseHandler : IRequestHandler<DeleteHouseCmd, DeleteHouseResponse>
    {
        private readonly ClubSysDbContext _dbContext;

        public DeleteHouseHandler(ClubSysDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<DeleteHouseResponse> Handle(DeleteHouseCmd request, CancellationToken cancellationToken)
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
                throw new UnauthorizedAccessException("Unauthorized: Only administrators are permitted to delete houses.");
            }

            // Retrieve the house to be deleted.
            var house = await _dbContext.Houses
                .FirstOrDefaultAsync(h => h.Id == request.HouseId, cancellationToken);

            if (house == null || house.IsDeleted)
            {
                throw new KeyNotFoundException($"House with ID {request.HouseId} not found or has already been deleted.");
            }

            // SOFT DELETE: Mark the house as deleted rather than removing it from the database.
            house.IsDeleted = true;
            house.DeletedOn = DateTimeOffset.UtcNow;

            await _dbContext.SaveChangesAsync(cancellationToken);

            return new DeleteHouseResponse
            {
                HouseId = house.Id,
                IsDeleted = house.IsDeleted,
                DeletedOn = house.DeletedOn.Value,
                Message = "House has been soft-deleted successfully."
            };
        }
    }
}
