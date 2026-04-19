namespace ClubSys.Features.Users.UpdateUser
{
    /// <summary>
    /// Response model for the general profile settings update.
    /// </summary>
    public class UpdateUserSettingsResponse
    {
        public Guid UserId { get; set; }
        public string StudentId { get; set; } = null!;
        public string UserName { get; set; } = null!;
        public int YrLevel { get; set; }
        public string Course { get; set; } = null!;
        public DateTimeOffset UpdatedOn { get; set; }
    }
}
