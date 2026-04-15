using ClubSys.Domain.Enums;

namespace ClubSys.Domain.Entities
{
    public class ChatMessage
    {
        public Guid ChatMessageId { get; set; }
        public AgentRoles Role { get; set; }
        public string Content { get; set; } = null!;
        public DateTime TimeStamp { get; set; }

    }
}
