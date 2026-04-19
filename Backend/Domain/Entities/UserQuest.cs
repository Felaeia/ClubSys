using System.ComponentModel.DataAnnotations.Schema;

namespace ClubSys.Domain.Entities
{
    public class UserQuest
    {
        public Guid Id { get; set; }

        [ForeignKey(nameof(User))]
        public Guid CompletedBy { get; set; }
        public User User { get; set; } = null!;

        public Guid QuestId { get; set; }
        public Quest Quest { get; set; } = null!;

        public DateTimeOffset CompletedAt { get; set; }
    }
}
