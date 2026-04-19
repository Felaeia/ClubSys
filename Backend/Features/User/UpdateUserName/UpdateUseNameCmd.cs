using ClubSys.Domain.Enums;
using MediatR;

namespace ClubSys.Features.Users.UpdateUser
{
    public record UpdateUseNameCmd(Guid UserId,string UserName) :
        IRequest<UpdateUserNameResponse>;
}
