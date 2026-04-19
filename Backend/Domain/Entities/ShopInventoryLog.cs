using System.ComponentModel.DataAnnotations.Schema;

namespace ClubSys.Domain.Entities
{
    public class ShopInventoryLog
    {
        public Guid Id { get; set; }

        [ForeignKey("Item")]
        public Guid ItemId { get; set; }
        public MeritShopItem Item { get; set; } = null!; // Assumes your shop item entity is named MeritShopItem

        // Explicit delta tracking prevents "dirty read" math errors
        public int StockDelta { get; set; }
        public int PreviousStock { get; set; }
        public int NewStock { get; set; }

        public string Reason { get; set; } = null!; // e.g., "Restock", "Damage", "Purchase"

        // Traceability to the actor (could be an Admin for restocks, or a User for purchases)

        [ForeignKey("AdjustedBy")]
        public Guid AdjustedById { get; set; }
        public User AdjustedBy { get; set; } = null!;

        public DateTimeOffset AdjustedAt { get; set; }
    }
}
