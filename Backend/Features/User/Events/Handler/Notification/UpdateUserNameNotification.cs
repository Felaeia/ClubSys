using MediatR;

namespace ClubSys.Features.Users.Events.Handler.Notification
{
    public class UpdateUserNameNotification : INotificationHandler<UpdateUserNameEvent>
    {
        private readonly ILogger<UpdateUserNameNotification> _logger;
        public UpdateUserNameNotification(ILogger<UpdateUserNameNotification> logger)
        {
            _logger = logger;
        }

        public Task Handle(UpdateUserNameEvent notification, CancellationToken cancellationToken)
        {
            _logger.LogInformation("User name updated: {UserId}, NewUserName: {NewUserName}, UpdatedOn: {UpdatedOn}",
                notification.UserId, notification.NewUserName, notification.UpdatedOn);
            return Task.CompletedTask;
        }
    }
}
