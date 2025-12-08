using ClubSys.Domain.Entities;
using ClubSys.Features.Agent.Common;
using ClubSys.Features.Agent.SendMessage;
using ClubSys.Infastructure.Data;
using Google.GenAI;
using Google.GenAI.Types;
using MediatR;
using Microsoft.EntityFrameworkCore;

namespace ClubSys.Features.Agent.SendAgentMessage
{
    public class SendAgentMessageHandler : IRequestHandler<SendAgentMessageCmd, AgentResponse>
    {
        private readonly ClubSysDbContext _ClubSysdbContext;
        private readonly IMediator _mediator;
        private readonly string _apiKey;
        private readonly GetRoleForAgent _getRoleForAgent;

        public SendAgentMessageHandler(ClubSysDbContext dbContext, IMediator mediator, GetRoleForAgent getRoleForAgent, GetGeminiApiKey geminiApiKey)
        {
            _ClubSysdbContext = dbContext;
            _mediator = mediator;
            _getRoleForAgent = getRoleForAgent;
            _apiKey = geminiApiKey.GeminiKey();
        }

        public async Task<AgentResponse> Handle(SendAgentMessageCmd request, CancellationToken cancellationToken)
        {
            // 1. Save User Message
            var userMessage = new ChatMessage
            {
                ChatMessageId = Guid.NewGuid(),
                Content = request.message,
                Role = (Domain.Enums.AgentRoles)1, // 1 = User
                TimeStamp = DateTime.UtcNow
            };

            _ClubSysdbContext.ChatMessages.Add(userMessage);
            await _ClubSysdbContext.SaveChangesAsync();

            // 2. Load History
            // Step A: Get the 20 NEWEST messages (Descending)
            var rawHistory = await _ClubSysdbContext.ChatMessages
                .OrderByDescending(cm => cm.TimeStamp)
                .Take(20)
                .ToListAsync();

            // Step B: FLIP them back to Chronological Order (Oldest -> Newest)
            // Agent needs to read the story from start to finish, not finish to start.
            var history = rawHistory.OrderBy(cm => cm.TimeStamp).ToList();

            // 3. Format for agent SDK
            var client = new Client(apiKey: _apiKey);

            var contentList = history.Select(cm => new Content
            {
                Role = _getRoleForAgent.GetGeminiRole((int)cm.Role),
                Parts = new List<Part> { new Part { Text = cm.Content } }
            }).ToList();

            try
            {
                // 4. Call Agent API
                var response = await client.Models.GenerateContentAsync("models/gemini-2.5-flash", contentList);
                var agentMessageText = response?.Candidates?.FirstOrDefault()?.Content?.Parts?.FirstOrDefault()?.Text ??
                    "I'm Sorry I can't generate a response at this time.";

                var aiMessage = new ChatMessage
                {
                    ChatMessageId = Guid.NewGuid(),
                    Content = agentMessageText,
                    Role = (Domain.Enums.AgentRoles)2, // 2 = Model
                    TimeStamp = DateTime.UtcNow
                };

                _ClubSysdbContext.ChatMessages.Add(aiMessage);
                await _ClubSysdbContext.SaveChangesAsync();

                var agentresponse = new AgentResponse
                {
                    Message = agentMessageText
                };

                return agentresponse;
            }
            catch (Exception ex)
            {
                // Handle exceptions (e.g., log the error)
                var errorResponse = new AgentResponse
                {
                    Message = $"Error generating response: {ex.Message}"
                };
                return errorResponse;
            }
        }

    }
}
