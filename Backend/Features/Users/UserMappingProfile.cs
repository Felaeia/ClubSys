using AutoMapper;
using ClubSys.Domain.Entities;

namespace ClubSys.Features.Users
{
    public class UserMappingProfile : Profile
    {
        public UserMappingProfile()
        {
            CreateMap<User, GetUsersById.GetUserByIdResponse>();
            CreateMap<User, GetAllUsers.GetAllUsersResponse>();
        }
    }
}
