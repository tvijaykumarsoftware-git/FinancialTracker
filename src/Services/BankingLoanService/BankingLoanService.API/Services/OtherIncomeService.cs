using BankingLoanService.API.Contracts;
using BankingLoanService.API.Database;
using BankingLoanService.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BankingLoanService.API.Services;

public sealed class OtherIncomeService(BankingDbContext dbContext) : IOtherIncomeService
{
    public async Task<IReadOnlyList<OtherIncomeResponse>> GetIncomeSourcesAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var sources = await dbContext.OtherIncome
            .AsNoTracking()
            .Where(source => source.UserId == userId)
            .OrderBy(source => source.Category)
            .ThenBy(source => source.SourceName)
            .ToListAsync(cancellationToken);

        return sources.Select(Map).ToList();
    }

    public async Task<OtherIncomeResponse?> GetIncomeSourceAsync(
        Guid userId,
        Guid incomeId,
        CancellationToken cancellationToken)
    {
        var source = await dbContext.OtherIncome
            .AsNoTracking()
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.IncomeId == incomeId,
                cancellationToken);

        return source is null ? null : Map(source);
    }

    public async Task<OtherIncomeResponse> CreateIncomeSourceAsync(
        Guid userId,
        CreateOtherIncomeRequest request,
        CancellationToken cancellationToken)
    {
        var source = new OtherIncome
        {
            UserId = userId,
            SourceName = request.SourceName.Trim(),
            Amount = request.Amount,
            Frequency = request.Frequency.Trim(),
            Category = request.Category.Trim()
        };

        dbContext.OtherIncome.Add(source);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Map(source);
    }

    private static OtherIncomeResponse Map(OtherIncome source) =>
        new(
            source.IncomeId,
            source.UserId,
            source.SourceName,
            source.Amount,
            source.Frequency,
            source.Category);
}
