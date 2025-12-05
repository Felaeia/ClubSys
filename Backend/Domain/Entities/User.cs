using System.ComponentModel.DataAnnotations;

namespace ClubSys.Domain.Entities
{
    public class User
    {
        public Guid UserId { get; set; }
        public string StudentId { get; set; } = null!;
        public string UserName { get; set; } = null!;
        [EmailAddress]
        public string Email { get; set; } = null!;
        [Required]
        public byte[] PasswordHash { get; set; } = null!;
        public byte[] PasswordSalt { get; set; } = null!;
        public GlobalRole GlobalRole { get; set; } = GlobalRole.Student;
        public DateTimeOffset CreatedOn { get; set; }
    }
}
