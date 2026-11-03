using BankingLoanService.API.Contracts;
using BankingLoanService.API.Database;
using BankingLoanService.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BankingLoanService.API.Services;

public sealed class InformalDebtService(BankingDbContext dbContext) : IInformalDebtService
{
    public async Task<IReadOnlyList<InformalDebtResponse>> GetDebtsAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var debts = await dbContext.InformalDebts
            .AsNoTracking()
            .Where(debt => debt.UserId == userId)
            .OrderBy(debt => debt.TargetRepaymentDate)
            .ThenBy(debt => debt.LenderName)
            .ToListAsync(cancellationToken);

        return debts.Select(Map).ToList();
    }

    public async Task<InformalDebtResponse?> GetDebtAsync(
        Guid userId,
        Guid debtId,
        CancellationToken cancellationToken)
    {
        var debt = await dbContext.InformalDebts
            .AsNoTracking()
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.DebtId == debtId,
                cancellationToken);

        return debt is null ? null : Map(debt);
    }

    public async Task<InformalDebtResponse> CreateDebtAsync(
        Guid userId,
        CreateInformalDebtRequest request,
        CancellationToken cancellationToken)
    {
        var debt = new InformalDebt
        {
            UserId = userId,
            LenderName = request.LenderName.Trim(),
            Notes = request.Notes.Trim(),
            OriginalAmount = request.OriginalAmount,
            RemainingBalance = request.OriginalAmount,
            TargetRepaymentDate = request.TargetRepaymentDate
        };

        dbContext.InformalDebts.Add(debt);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Map(debt);
    }

    public async Task<InformalDebtPaybackResult> RecordPaybackAsync(
        Guid userId,
        Guid debtId,
        decimal amount,
        CancellationToken cancellationToken)
    {
        var updatedRows = await dbContext.InformalDebts
            .Where(debt =>
                debt.UserId == userId &&
                debt.DebtId == debtId &&
                debt.RemainingBalance >= amount)
            .ExecuteUpdateAsync(
                setters => setters.SetProperty(
                    debt => debt.RemainingBalance,
                    debt => debt.RemainingBalance - amount),
                cancellationToken);

        if (updatedRows == 0)
        {
            var exists = await dbContext.InformalDebts
                .AsNoTracking()
                .AnyAsync(debt => debt.UserId == userId && debt.DebtId == debtId, cancellationToken);

            return exists
                ? new InformalDebtPaybackResult(true, false, null)
                : new InformalDebtPaybackResult(false, false, null);
        }

        var updatedDebt = await dbContext.InformalDebts
            .AsNoTracking()
            .FirstAsync(debt => debt.UserId == userId && debt.DebtId == debtId, cancellationToken);

        return new InformalDebtPaybackResult(true, true, Map(updatedDebt));
    }

    private static InformalDebtResponse Map(InformalDebt debt) =>
        new(
            debt.DebtId,
            debt.UserId,
            debt.LenderName,
            debt.Notes,
            debt.OriginalAmount,
            debt.RemainingBalance,
            debt.TargetRepaymentDate);
}
