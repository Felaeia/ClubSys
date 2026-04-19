namespace ClubSys.Features.Users.UpdateUserSettingSecurity
{
    /// <summary>
    /// Response model for the security settings update.
    /// </summary>
    public class UpdateUserSettingSecurityResponse
    {
        public Guid UserId { get; set; }
        public string Message { get; set; } = string.Empty;
        public bool IsEmailUpdated { get; set; }
        public bool IsPasswordUpdated { get; set; }
        public DateTimeOffset UpdatedOn { get; set; }
    }
}
