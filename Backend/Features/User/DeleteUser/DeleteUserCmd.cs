using MediatR;

namespace ClubSys.Features.Users.DeleteUser
{
    public record DeleteUserCmd(Guid UserId) :
        IRequest<DeleteUserResponse>;
}
