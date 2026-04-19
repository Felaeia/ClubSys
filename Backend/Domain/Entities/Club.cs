namespace ClubSys.Domain.Entities
{
    public class Club
    {
        public Guid Id { get; set; }
        public string ClubName { get; set; } = null!;
        public string Description { get; set; } = null!;
        public bool IsActive { get; set; } = true;
    }
}
