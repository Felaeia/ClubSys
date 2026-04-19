using ClubSys.Domain.Entities;
using ClubSys.Domain.Enums;
using ClubSys.Infastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClubSys.Features.House.CreateHouse
{
    /// <summary>
    /// Handler for creating a new house.
    /// Verifies that the requester is an administrative user.
    /// </summary>
    public class CreateHouseHandler : IRequestHandler<CreateHouseCmd, CreateHouseResponse>
    {
        private readonly ClubSysDbContext _dbContext;

        public CreateHouseHandler(ClubSysDbContext dbContext)
        {
            _dbContext = dbContext;
        }

        public async Task<CreateHouseResponse> Handle(CreateHouseCmd request, CancellationToken cancellationToken)
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
                // In a real application, you might use a 403 Forbidden custom exception or similar.
                throw new UnauthorizedAccessException("Unauthorized: Only administrators are permitted to create houses.");
            }

            // Create and persist the new house.
            var house = new Domain.Entities.House
            {
                Id = Guid.NewGuid(),
                HouseName = request.HouseName,
                Description = request.Description
            };

            _dbContext.Houses.Add(house);
            await _dbContext.SaveChangesAsync(cancellationToken);

            return new CreateHouseResponse
            {
                HouseId = house.Id,
                HouseName = house.HouseName,
                Description = house.Description,
                CreatedOn = DateTimeOffset.UtcNow
            };
        }
    }
}
