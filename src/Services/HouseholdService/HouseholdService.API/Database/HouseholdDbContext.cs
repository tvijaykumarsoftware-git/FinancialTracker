using HouseholdService.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HouseholdService.API.Database;

public sealed class HouseholdDbContext(DbContextOptions<HouseholdDbContext> options) : DbContext(options)
{
    public DbSet<HouseholdBill> HouseholdBills => Set<HouseholdBill>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var bills = modelBuilder.Entity<HouseholdBill>();
        bills.ToTable("HouseholdBills");
        bills.HasKey(bill => bill.BillId);
        bills.Property(bill => bill.BillId).HasDefaultValueSql("NEWID()");
        bills.Property(bill => bill.UserId).IsRequired();
        bills.HasIndex(bill => bill.UserId);
        bills.Property(bill => bill.Category).HasMaxLength(50).IsRequired();
        bills.Property(bill => bill.ProviderName).HasMaxLength(150).IsRequired();
        bills.Property(bill => bill.ConsumerNumber).HasMaxLength(100).HasDefaultValue(string.Empty).IsRequired();
        bills.Property(bill => bill.Amount).HasPrecision(18, 2);
        bills.Property(bill => bill.DueDate).HasColumnType("date");
        bills.Property(bill => bill.PaidStatus).HasMaxLength(20).HasDefaultValue("Pending").IsRequired();
        bills.Property(bill => bill.PaidOn).HasColumnType("datetime2");
    }
}