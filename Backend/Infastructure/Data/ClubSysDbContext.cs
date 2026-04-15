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
        public DbSet<ChatMessage> ChatMessages { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.ApplyConfigurationsFromAssembly(typeof(ClubSysDbContext).Assembly);

            modelBuilder.Entity<ChatMessage>()
                .Property(e => e.Role)
                .HasConversion<string>(); // Automatically converts Enum <-> String for DB
        }
    }
}
