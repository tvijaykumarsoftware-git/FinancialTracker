using CreditScoreService.API.Contracts;
using CreditScoreService.API.Database;
using CreditScoreService.API.Models;
using Microsoft.EntityFrameworkCore;

namespace CreditScoreService.API.Services;

public sealed class CreditScoreService(CreditScoreDbContext dbContext) : ICreditScoreService
{
    public async Task<IReadOnlyList<CreditScoreReportResponse>> GetReportsAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var reports = await dbContext.CreditScoreReports
            .AsNoTracking()
            .Where(report => report.UserId == userId)
            .OrderByDescending(report => report.ReportDate)
            .ToListAsync(cancellationToken);
        return reports.Select(Map).ToList();
    }

    public async Task<CreditScoreReportResponse?> GetLatestReportAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var report = await dbContext.CreditScoreReports
            .AsNoTracking()
            .Where(item => item.UserId == userId)
            .OrderByDescending(item => item.ReportDate)
            .FirstOrDefaultAsync(cancellationToken);
        return report is null ? null : Map(report);
    }

    public async Task<CreditScoreReportResponse?> GetReportAsync(
        Guid userId,
        Guid reportId,
        CancellationToken cancellationToken)
    {
        var report = await dbContext.CreditScoreReports
            .AsNoTracking()
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.ReportId == reportId,
                cancellationToken);
        return report is null ? null : Map(report);
    }

    public async Task<CreditScoreReportResponse> CreateReportAsync(
        Guid userId,
        CreateCreditScoreReportRequest request,
        CancellationToken cancellationToken)
    {
        var report = new CreditScoreReport
        {
            UserId = userId,
            BureauName = request.BureauName.Trim(),
            CreditScore = request.CreditScore,
            ReportDate = request.ReportDate,
            SummaryNotes = request.SummaryNotes?.Trim()
        };
        dbContext.CreditScoreReports.Add(report);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Map(report);
    }

    public async Task<CreditScoreReportResponse?> UpdateReportAsync(
        Guid userId,
        Guid reportId,
        UpdateCreditScoreReportRequest request,
        CancellationToken cancellationToken)
    {
        var report = await dbContext.CreditScoreReports.FirstOrDefaultAsync(
            item => item.UserId == userId && item.ReportId == reportId,
            cancellationToken);
        if (report is null)
        {
            return null;
        }

        report.BureauName = request.BureauName.Trim();
        report.CreditScore = request.CreditScore;
        report.ReportDate = request.ReportDate;
        report.SummaryNotes = request.SummaryNotes?.Trim();
        await dbContext.SaveChangesAsync(cancellationToken);
        return Map(report);
    }

    public async Task<bool> DeleteReportAsync(Guid userId, Guid reportId, CancellationToken cancellationToken)
    {
        var report = await dbContext.CreditScoreReports.FirstOrDefaultAsync(
            item => item.UserId == userId && item.ReportId == reportId,
            cancellationToken);
        if (report is null)
        {
            return false;
        }

        dbContext.CreditScoreReports.Remove(report);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<IReadOnlyList<FinancialSourceResponse>> GetSourcesAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var sources = await dbContext.OtherFinancialSources
            .AsNoTracking()
            .Where(source => source.UserId == userId)
            .OrderByDescending(source => source.TransactionDate)
            .ToListAsync(cancellationToken);
        return sources.Select(Map).ToList();
    }

    public async Task<FinancialSourceResponse?> GetSourceAsync(
        Guid userId,
        Guid sourceId,
        CancellationToken cancellationToken)
    {
        var source = await dbContext.OtherFinancialSources
            .AsNoTracking()
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.SourceId == sourceId,
                cancellationToken);
        return source is null ? null : Map(source);
    }

    public async Task<FinancialSourceResponse> CreateSourceAsync(
        Guid userId,
        CreateFinancialSourceRequest request,
        CancellationToken cancellationToken)
    {
        var source = new OtherFinancialSource
        {
            UserId = userId,
            SourceName = request.SourceName.Trim(),
            Category = request.Category.Trim(),
            Amount = request.Amount,
            TransactionDate = request.TransactionDate
        };
        dbContext.OtherFinancialSources.Add(source);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Map(source);
    }

    public async Task<FinancialSourceResponse?> UpdateSourceAsync(
        Guid userId,
        Guid sourceId,
        UpdateFinancialSourceRequest request,
        CancellationToken cancellationToken)
    {
        var source = await dbContext.OtherFinancialSources.FirstOrDefaultAsync(
            item => item.UserId == userId && item.SourceId == sourceId,
            cancellationToken);
        if (source is null)
        {
            return null;
        }

        source.SourceName = request.SourceName.Trim();
        source.Category = request.Category.Trim();
        source.Amount = request.Amount;
        source.TransactionDate = request.TransactionDate;
        await dbContext.SaveChangesAsync(cancellationToken);
        return Map(source);
    }

    public async Task<bool> DeleteSourceAsync(Guid userId, Guid sourceId, CancellationToken cancellationToken)
    {
        var source = await dbContext.OtherFinancialSources.FirstOrDefaultAsync(
            item => item.UserId == userId && item.SourceId == sourceId,
            cancellationToken);
        if (source is null)
        {
            return false;
        }

        dbContext.OtherFinancialSources.Remove(source);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static CreditScoreReportResponse Map(CreditScoreReport report) =>
        new(
            report.ReportId,
            report.UserId,
            report.BureauName,
            report.CreditScore,
            report.ReportDate,
            report.SummaryNotes);

    private static FinancialSourceResponse Map(OtherFinancialSource source) =>
        new(
            source.SourceId,
            source.UserId,
            source.SourceName,
            source.Category,
            source.Amount,
            source.TransactionDate);
}
