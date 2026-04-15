using ClubSys.Domain.Entities;
using ClubSys.Domain.Enums;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;

namespace ClubSys.Infastructure.Data.Configurations
{
    public class UserConfiguration : IEntityTypeConfiguration<User>
    {
        public void Configure(EntityTypeBuilder<User> builder)
        {
            // Primary Key
            builder.HasKey(u => u.UserId);
            
            // Unique Constraints
            builder.HasIndex(u => u.StudentId)
                    .IsUnique();
            builder.HasIndex(u => u.Email)
                    .IsUnique();

            // Propery Configurations
            builder.Property(u => u.UserName)
                   .IsRequired()
                   .HasMaxLength(100);
            builder.Property(u => u.Email)
                   .IsRequired()
                   .HasMaxLength(255);
            builder.Property(u => u.GlobalRole)
                .HasConversion(
                    v => v.ToString(),
                    v => (GlobalRole)Enum.Parse(typeof(GlobalRole), v));
        }
    }
}
