namespace ClubSys.Features.Agent.Common
{
    public class GetRoleForAgent
    {
        public string GetGeminiRole(int roleId)
        {
            // Map our Role IDs to Gemini Role Strings
            return roleId == 1 ? "user" : "model";
        }
    }
}
