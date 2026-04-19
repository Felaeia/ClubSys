namespace ClubSys.Domain.Entities
{
    public class MeritShopItem
    {
        public Guid Id { get; set; }
        public string ProductType { get; set; } = null!;
        public string ProductName { get; set; } = null!;
        public string Description { get; set; } = null!;
        public int Cost { get; set; }
        public int StockQuantity { get; set; }
        public bool IsActive { get; set; } = true;
    }
}
