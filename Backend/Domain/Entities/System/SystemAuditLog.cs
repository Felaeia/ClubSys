using System.ComponentModel.DataAnnotations.Schema;

namespace ClubSys.Domain.Entities.System
{
    public class SystemAuditLog
    {
        public Guid Id { get; set; }

        // The target entity context
        public string TableName { get; set; } = null!; // e.g., 'quests', 'merit_shop_items'
        public Guid RecordId { get; set; } // The primary key of the affected record

        public string ActionType { get; set; } = null!; // e.g., "UPDATE", "DELETE"

        // Stored as serialized JSON strings to support polymorphic payloads.
        // Nullable because an 'INSERT' has no OldPayload, and a 'DELETE' has no NewPayload.
        public string? OldPayload { get; set; } // Pre-mutation state
        public string? NewPayload { get; set; } // Post-mutation state

        // Traceability to the actor
        [ForeignKey("ChangedBy")]
        public Guid ChangedById { get; set; }
        public User ChangedBy { get; set; } = null!;

        public DateTimeOffset ChangedAt { get; set; }
    }
}
