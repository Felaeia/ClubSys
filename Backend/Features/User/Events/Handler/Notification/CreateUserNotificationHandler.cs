using MediatR;

namespace ClubSys.Features.Users.Events.Handler
{
    public class CreateUserNotificationHandler : INotificationHandler<UserCreatedEvent>
    {
        private readonly ILogger<CreateUserNotificationHandler> _logger;
        public CreateUserNotificationHandler(ILogger<CreateUserNotificationHandler> logger)
        {
            _logger = logger;
        } 

        public Task Handle(UserCreatedEvent notification, CancellationToken cancellationToken)
        {
            _logger.LogInformation("New user created: {UserId}, UserName: {UserName}, CreatedOn: {CreatedOn}",
                notification.UserId, notification.UserName, notification.CreatedOn);
            return Task.CompletedTask;
        }
    } 
}
