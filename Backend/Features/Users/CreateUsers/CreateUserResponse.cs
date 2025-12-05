using ClubSys.Domain.Entities;
using System.ComponentModel.DataAnnotations;

namespace ClubSys.Features.Users.CreateUsers
{
    public class CreateUserResponse
    {
        public Guid UserId { get; set; }
        public string StudentId { get; set; } = null!;
        public string UserName { get; set; } = null!;
        [EmailAddress]
        public string Email { get; set; } = null!;
        public GlobalRole GlobalRole { get; set; } = GlobalRole.Student;
        public DateTimeOffset CreatedOn { get; set; }
    }
}
