using ClubSys.Infastructure.Behaviors;
using ClubSys.Infastructure.Data;
using FluentValidation;
using MediatR;
using Microsoft.Data.Sqlite;
using Microsoft.EntityFrameworkCore;
using System.Data.Common;

namespace ClubSys.Extensions
{
    public static class ServiceCollectionExtensions
    {
        public static IServiceCollection AddApplicationServices(
            this IServiceCollection services)
        {
            #region Database Development Sqlite Setup Connection to RAM(ONLY FOR DEVELOPMENT)
            var connectionString = "DataSource=:memory:";
            var connection = new SqliteConnection(connectionString);
            connection.Open();
            services.AddSingleton<DbConnection>(connection);
            services.AddDbContext<ClubSysDbContext>(options =>
                options.UseSqlite(connection));
            #endregion

            // Register application services 
            services.AddMediatR(cfg =>
                {
                    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);

                    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(LoggingBehavior<,>));
                    cfg.AddBehavior(typeof(IPipelineBehavior<,>), typeof(ValidationBehavior<,>));
                });
            // For In-Memory Database (ONLY FOR TESTING PURPOSES)
            //services.AddDbContext<ClubSysDbContext>(options => options.UseInMemoryDatabase("ClubSysDb"));
            services.AddValidatorsFromAssemblyContaining<Program>();
            services.AddAutoMapper(cfg => { }, typeof(Program).Assembly);
            services.AddMemoryCache();


            return services;
        }
    }
}
