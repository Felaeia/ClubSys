using MediatR;
using ClubSys.Infastructure.Data;
using AutoMapper;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Caching.Memory;

namespace ClubSys.Features.Users.GetUsersById
{
    public class GetUserByIdHandler : IRequestHandler<GetUserByIdQuery, GetUserByIdResponse?>
    {
        private readonly ClubSysDbContext _dbContext;
        private readonly IMapper _mapper;
        private readonly IMemoryCache _cache;

        public GetUserByIdHandler(ClubSysDbContext dbContext, IMapper mapper, IMemoryCache cache)
        {
            _dbContext = dbContext;
            _mapper = mapper;
            _cache = cache;
        }

        public async Task<GetUserByIdResponse?> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
        {
            string cacheKey = $"GetUserById_{request.userId}";

            if (_cache.TryGetValue(cacheKey, out var cachedObj) && cachedObj is IEnumerable<GetUserByIdResponse> cachedUser)
            {
                return cachedUser.FirstOrDefault();
            }

            var user = await _dbContext.Users.FirstOrDefaultAsync(u => u.UserId == request.userId, cancellationToken);

            if (user == null) return null;
            
            var cacheEntryOptions = new MemoryCacheEntryOptions()
                    .SetSlidingExpiration(TimeSpan.FromMinutes(30))
                    .SetAbsoluteExpiration(TimeSpan.FromHours(6));

            var GetUserByIdResponse = _mapper.Map<GetUserByIdResponse>(user);
            _cache.Set(cacheKey, GetUserByIdResponse, cacheEntryOptions);

            return GetUserByIdResponse;
        }
    }
}
