using MediatR;

namespace ClubSys.Features.Users.GetUsersById
{
    public record GetUserByIdQuery(Guid userId) : IRequest<GetUserByIdResponse?>;
}
