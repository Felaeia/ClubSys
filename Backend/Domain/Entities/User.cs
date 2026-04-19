using ClubSys.Domain.Enums;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace ClubSys.Domain.Entities
{
    public class User
    {
        public Guid Id { get; set; }

        [ForeignKey(nameof(House))]
        public Guid HouseId { get; set; }
        public House House { get; set; } = null!;

        public string StudentId { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public string Email { get; set; } = null!;
        public int YrLevel { get; set; }
        public string Course { get; set; } = null!;
        public byte[] PasswordHash { get; set; } = null!;
        public byte[] PasswordSalt { get; set; } = null!;
        public GlobalRole GlobalRole { get; set; } = GlobalRole.Student;
        public DateTimeOffset CreatedOn { get; set; }
    }
}
