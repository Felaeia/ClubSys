namespace ClubSys.Domain.Entities
{
    public class ClubMembership
    {
        public Guid UserId { get; set; } //FK to User
        public User User { get; set; } = null!;

        public Guid ClubId { get; set; } //FK to Club
        public Club Club { get; set; } = null!;

        public string Role { get; set; } = null!;
        public DateTimeOffset JoinedAt { get; set; }

    }
}
