using MediatR;

namespace ClubSys.Features.Users.Events
{
    public class UserCreatedEvent : INotification
    {
        public Guid UserId { get; }
        public string UserName { get; }
        public DateTimeOffset CreatedOn { get; }

        public UserCreatedEvent(Guid userId, string userName, DateTimeOffset createdOn)
        {
            UserId = userId;
            UserName = userName;
            CreatedOn = createdOn;
        }
    }
}
