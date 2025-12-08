using ClubSys.Features.Agent.SendMessage;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ClubSys.API.Controllers
{
    [Route("api/[controller]")] // This makes the URL: /api/chat
    [ApiController]
    public class ChatController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ChatController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<IActionResult> SendMessage([FromBody]SendAgentMessageCmd cmd)
        {
            var result = await _mediator.Send(cmd);
            return Ok(result);
        }
    }
}