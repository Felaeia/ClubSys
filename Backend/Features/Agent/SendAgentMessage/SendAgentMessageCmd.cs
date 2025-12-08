using ClubSys.Features.Agent.SendAgentMessage;
using MediatR;

namespace ClubSys.Features.Agent.SendMessage
{
    public record SendAgentMessageCmd(string message) :
        IRequest<AgentResponse>; 
}