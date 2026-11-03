using Microsoft.EntityFrameworkCore;
using UserService.API.Models;

namespace UserService.API.Database;

public sealed class FinancialTrackerDbContext(DbContextOptions<FinancialTrackerDbContext> options)
    : DbContext(options)
{
    public DbSet<UserAccount> Users => Set<UserAccount>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var users = modelBuilder.Entity<UserAccount>();
        users.ToTable("Users");
        users.HasKey(user => user.UserId);
        users.Property(user => user.UserId).HasDefaultValueSql("NEWID()");
        users.Property(user => user.FirstName).HasMaxLength(100).IsRequired();
        users.Property(user => user.LastName).HasMaxLength(100).IsRequired();
        users.Property(user => user.Email).HasMaxLength(255).IsRequired();
        users.HasIndex(user => user.Email).IsUnique();
        users.Property(user => user.PhoneNumber).HasMaxLength(20).IsRequired();
        users.Property(user => user.PasswordHash).HasMaxLength(500);
        users.Property(user => user.CreatedAt).HasDefaultValueSql("GETUTCDATE()");
    }
}
