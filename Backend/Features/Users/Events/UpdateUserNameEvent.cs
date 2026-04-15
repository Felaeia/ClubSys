using MediatR;

namespace ClubSys.Features.Users.Events
{
    public class UpdateUserNameEvent : INotification
    {
        public Guid UserId { get; }
        public string NewUserName { get; }
        public DateTimeOffset UpdatedOn { get; }
        public UpdateUserNameEvent(Guid userId, string newUserName, DateTimeOffset updatedOn)
        {
            UserId = userId;
            NewUserName = newUserName;
            UpdatedOn = updatedOn;
        }
    }
}
