using ClubSys.Features.Users.CreateUsers;
using ClubSys.Features.Users.GetAllUsers;
using ClubSys.Features.Users.GetUsersById;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ClubSys.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UsersController : ControllerBase
    {
        private readonly IMediator _mediator;

        public UsersController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<ActionResult<CreateUserResponse>> CreateUser([FromBody] CreateUserCmd cmd)
        {
            var result = await _mediator.Send(cmd);
            return Ok(result);
        }

        [HttpGet("{userId:guid}")]
        public async Task<ActionResult<GetUserByIdResponse?>> GetUserById(Guid userId)
        {
            var query = new GetUserByIdQuery(userId);
            var result = await _mediator.Send(query);
            if (result is null)
            {
                return NotFound();
            }
            return Ok(result);
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<GetAllUsersResponse>>> GetAllUsers()
        {
            var query = new GetAllUsersQuery();
            var result = await _mediator.Send(query);
            if (result is null)
            {
                return NotFound();
            }
            return Ok(result);
        }
    }
}
