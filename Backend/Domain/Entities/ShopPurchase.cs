namespace ClubSys.Domain.Entities
{
    public class ShopPurchase
    {
        public Guid Id { get; set; }

        public Guid UserId { get; set; }
        public User User { get; set; } = null!;

        public Guid MeritShopItemId { get; set; }
        public MeritShopItem MeritShopItem { get; set; } = null!;

        public DateTimeOffset PurchasedAt { get; set; }

    }
}
