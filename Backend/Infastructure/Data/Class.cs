//using ClubSys.Domain.Entities;
//using Microsoft.EntityFrameworkCore;

//namespace ClubSys.Infastructure.Data
//{
//    public class ChatContext : ClubSysDbContext
//    {
//        public ChatContext(DbContextOptions<ClubSysDbContext> options)
//            : base(options)
//        {
//        }
//        public DbSet<ChatMessage> ChatMessages { get; set; }

//        protected override void OnModelCreating(ModelBuilder modelBuilder)
//        {
//            modelBuilder.Entity<ChatMessage>()
//                .Property(e => e.Role)
//                .HasConversion<string>(); // Automatically converts Enum <-> String for DB
//        }
//    }
//}
