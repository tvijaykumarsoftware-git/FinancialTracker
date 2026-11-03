using BankingLoanService.API.Contracts;

namespace BankingLoanService.API.Services;

public interface IInformalDebtService
{
    Task<IReadOnlyList<InformalDebtResponse>> GetDebtsAsync(Guid userId, CancellationToken cancellationToken);

    Task<InformalDebtResponse?> GetDebtAsync(Guid userId, Guid debtId, CancellationToken cancellationToken);

    Task<InformalDebtResponse> CreateDebtAsync(
        Guid userId,
        CreateInformalDebtRequest request,
        CancellationToken cancellationToken);

    Task<InformalDebtPaybackResult> RecordPaybackAsync(
        Guid userId,
        Guid debtId,
        decimal amount,
        CancellationToken cancellationToken);
}

public sealed record InformalDebtPaybackResult(
    bool DebtFound,
    bool AmountApplied,
    InformalDebtResponse? Debt);
