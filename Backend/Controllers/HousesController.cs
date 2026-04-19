using ClubSys.Features.House.CreateHouse;
using ClubSys.Features.House.UpdateHouse;
using ClubSys.Features.House.DeleteHouse;
using MediatR;
using Microsoft.AspNetCore.Mvc;

namespace ClubSys.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class HousesController : ControllerBase
    {
        private readonly IMediator _mediator;

        public HousesController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpPost]
        public async Task<ActionResult<CreateHouseResponse>> CreateHouse([FromBody] CreateHouseCmd cmd)
        {
            var result = await _mediator.Send(cmd);
            return Ok(result);
        }

        [HttpPut]
        public async Task<ActionResult<UpdateHouseResponse>> UpdateHouse([FromBody] UpdateHouseCmd cmd)
        {
            var result = await _mediator.Send(cmd);
            return Ok(result);
        }

        [HttpDelete]
        public async Task<ActionResult<DeleteHouseResponse>> DeleteHouse([FromBody] DeleteHouseCmd cmd)
        {
            var result = await _mediator.Send(cmd);
            return Ok(result);
        }
    }
}
