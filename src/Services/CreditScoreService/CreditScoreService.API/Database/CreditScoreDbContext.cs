using CreditScoreService.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CreditScoreService.API.Database;

public sealed class CreditScoreDbContext(DbContextOptions<CreditScoreDbContext> options) : DbContext(options)
{
    public DbSet<CreditScoreReport> CreditScoreReports => Set<CreditScoreReport>();
    public DbSet<OtherFinancialSource> OtherFinancialSources => Set<OtherFinancialSource>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var reports = modelBuilder.Entity<CreditScoreReport>();
        reports.ToTable("CreditScoreReports");
        reports.HasKey(report => report.ReportId);
        reports.Property(report => report.ReportId).HasDefaultValueSql("NEWID()");
        reports.Property(report => report.UserId).IsRequired();
        reports.HasIndex(report => report.UserId);
        reports.Property(report => report.BureauName).HasMaxLength(50).IsRequired();
        reports.Property(report => report.CreditScore).IsRequired();
        reports.Property(report => report.ReportDate).HasColumnType("date");
        reports.Property(report => report.SummaryNotes);

        var sources = modelBuilder.Entity<OtherFinancialSource>();
        sources.ToTable("OtherFinancialSources");
        sources.HasKey(source => source.SourceId);
        sources.Property(source => source.SourceId).HasDefaultValueSql("NEWID()");
        sources.Property(source => source.UserId).IsRequired();
        sources.HasIndex(source => source.UserId);
        sources.Property(source => source.SourceName).HasMaxLength(100).IsRequired();
        sources.Property(source => source.Category).HasMaxLength(50).IsRequired();
        sources.Property(source => source.Amount).HasPrecision(18, 2);
        sources.Property(source => source.TransactionDate).HasColumnType("date");
    }
}
