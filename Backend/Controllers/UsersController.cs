using ClubSys.Features.Users.CreateUsers;
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
    }
}
