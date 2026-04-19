using ClubSys.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace ClubSys.Features.Users.GetUsersById
{
    public class GetUserByIdResponse
    {
        public Guid UserId { get; set; }
        public string StudentId { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public GlobalRole GlobalRole { get; set; } = GlobalRole.Student;
        public DateTimeOffset CreatedOn { get; set; }
    }
}
