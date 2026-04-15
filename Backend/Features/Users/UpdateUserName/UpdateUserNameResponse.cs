using ClubSys.Domain.Enums;
using System.ComponentModel.DataAnnotations;

namespace ClubSys.Features.Users.UpdateUser
{
    public class UpdateUserNameResponse
    {
        public Guid UserId { get; set; }
        public string UserName { get; set; } = null!;
        [EmailAddress]
        public DateTimeOffset DeletedOn { get; set; }
    }
}
