namespace ClubSys.Domain.Entities
{
    public class Quest
    {
        public Guid Id { get; set; }
        public string Title { get; set; } = null!;
        public string Description { get; set; } = null!;
        public string Type { get; set; } = null!;
        public int MeritRewardAmt { get; set; }
        public DateTimeOffset StartDate { get; set; }
        public DateTimeOffset EndDate { get; set; }
        public bool IsActive { get; set; } = true;

    }
}
