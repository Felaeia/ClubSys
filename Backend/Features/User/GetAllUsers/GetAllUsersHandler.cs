using AutoMapper;
using ClubSys.Infastructure.Data;
using MediatR;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace ClubSys.Features.Users.GetAllUsers
{
    public class GetAllUsersHandler : IRequestHandler<GetAllUsersQuery, List<GetAllUsersResponse>>
    {
        private readonly ClubSysDbContext _dbContext;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;

        public GetAllUsersHandler(ClubSysDbContext dbContext, IMapper mapper, IMemoryCache cache)
        {
            _dbContext = dbContext;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<List<GetAllUsersResponse>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
        {
            string cacheKey = "GetAllUsers";
            if (_cache.TryGetValue(cacheKey, out var cachedObj) && cachedObj is IEnumerable<GetAllUsersResponse> cachedUsers)
            {
                return (List<GetAllUsersResponse>)cachedUsers;
            }

            var users = await _dbContext.Users.ToListAsync(cancellationToken);

            var mappedUsers = _mapper.Map<IEnumerable<GetAllUsersResponse>>(users);
            _cache.Set(cacheKey, mappedUsers, TimeSpan.FromMinutes(10));

            return (List<GetAllUsersResponse>)mappedUsers;
        }
    }
}
