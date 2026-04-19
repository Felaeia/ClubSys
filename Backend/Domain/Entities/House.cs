namespace ClubSys.Domain.Entities
{
    public class House
    {
        public Guid Id { get; set; }
        public string HouseName { get; set; } = null!;
        public string Description { get; set; } = null!;
        public bool IsDeleted { get; set; }
        public DateTimeOffset? DeletedOn { get; set; }
    }
}
