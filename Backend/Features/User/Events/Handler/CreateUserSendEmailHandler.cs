using MediatR;

namespace ClubSys.Features.Users.Events.Handler
{
    public class CreateUserSendEmailHandler : INotificationHandler<UserCreatedEvent>
    {
        private readonly ILogger<CreateUserSendEmailHandler> _logger;

        public CreateUserSendEmailHandler(ILogger<CreateUserSendEmailHandler> logger)
        {
            _logger = logger;
        }

        public Task Handle(UserCreatedEvent notification, CancellationToken cancellationToken)
        {
            //CHORE: Future implementation for sending email to the newly created user
            _logger.LogInformation("User created event received for UserId: {UserId}, UserName: {UserName}", notification.UserId, notification.UserName);
            return Task.CompletedTask;
        }

    }
}
