using ClubSys.Domain.Enums;

namespace ClubSys.Features.Users.GetAllUsers
{
    public class GetAllUsersResponse
    {
        public Guid UserId { get; set; }
        public string StudentId { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public GlobalRole GlobalRole { get; set; } = GlobalRole.Student;
        public DateTimeOffset CreatedOn { get; set; }
    }
}
