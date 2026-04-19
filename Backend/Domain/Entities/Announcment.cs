using System.ComponentModel.DataAnnotations.Schema;

namespace ClubSys.Domain.Entities
{
    public class Announcment
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string Content { get; set; } = null!;

        [ForeignKey(nameof(User))]
        public Guid CreatedBy { get; set; }
        public User User { get; set; } = null!;

        public DateTimeOffset CreatedAt { get; set; }
        public DateTimeOffset UpdatedAt { get; set; }
        public bool IsActive { get; set; } = true;

    }
}
