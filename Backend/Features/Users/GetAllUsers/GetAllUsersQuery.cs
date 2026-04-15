using MediatR;

namespace ClubSys.Features.Users.GetAllUsers
{
    public record GetAllUsersQuery () : IRequest<List<GetAllUsersResponse>>;
}
