using ClubSys.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace ClubSys.Infastructure.Data
{
    public class ClubSysDbContext : DbContext
    {
        public ClubSysDbContext(DbContextOptions<ClubSysDbContext> options)
            : base(options)
        {
        }

        public DbSet<User> Users { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);
            // Apply User 
            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ClubSysDbContext).Assembly);
        }
    }
}
