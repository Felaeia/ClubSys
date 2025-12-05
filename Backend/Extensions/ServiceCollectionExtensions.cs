using ClubSys.Infastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace ClubSys.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(
            this IServiceCollection services)
            {
                // Register application services here
                // e.g., services.AddTransient<IMyService, MyService>();
                services.AddMediatR(cfg => cfg.RegisterServicesFromAssembly(typeof(Program).Assembly));
                services.AddDbContext<ClubSysDbContext>(options =>
                    options.UseInMemoryDatabase("ClubSysDb"));
            return services;
            }
    }
}
