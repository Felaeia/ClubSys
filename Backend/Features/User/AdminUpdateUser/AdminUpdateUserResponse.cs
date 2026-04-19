using ClubSys.Domain.Enums;

namespace ClubSys.Features.Users.AdminUpdateUser
{
    /// <summary>
    /// Response model for the administrative user update.
    /// </summary>
    public class AdminUpdateUserResponse
    {
        public Guid UserId { get; set; }
        public Guid HouseId { get; set; }
        public string StudentId { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public int YrLevel { get; set; }
        public string Course { get; set; } = null!;
        public GlobalRole GlobalRole { get; set; }
        public DateTimeOffset UpdatedOn { get; set; }
    }
}
