namespace ClubSys.Features.Agent.Common
{
    public class GetGeminiApiKey
    {
        public string? GeminiApiKey = Environment.GetEnvironmentVariable("Gemini_API_Key");

        public string GeminiKey()
        {
            return GeminiApiKey ?? string.Empty;
        }
    }
}
