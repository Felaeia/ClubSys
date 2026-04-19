namespace ClubSys.Domain.Entities
{
    public class MeritTransaction
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public int Amount { get; set; }
        public string TransactionType { get; set; } = null!;

        // Internal System Traceability (Polymorphic Pattern)
        public string SourceType { get; set; } = null!; // e.g., "Quest", "ShopPurchase", "AdminAdjustment"
        public Guid SourceId { get; set; } // e.g., QuestId, ShopPurchaseId, or AdminAdjustmentId

        // Blockchain Traceability (Strictly Required)
        public string TransactionHash { get; set; } = null!; // Hash of the blockchain transaction for traceability
        public long LogIndex { get; set; } //Hash of the block containing the transaction

        public DateTimeOffset CreatedAt { get; set; }
    }
}
