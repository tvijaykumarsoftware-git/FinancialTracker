using BankingLoanService.API.Contracts;

namespace BankingLoanService.API.Services;

public interface IOtherIncomeService
{
    Task<IReadOnlyList<OtherIncomeResponse>> GetIncomeSourcesAsync(Guid userId, CancellationToken cancellationToken);

    Task<OtherIncomeResponse?> GetIncomeSourceAsync(
        Guid userId,
        Guid incomeId,
        CancellationToken cancellationToken);

    Task<OtherIncomeResponse> CreateIncomeSourceAsync(
        Guid userId,
        CreateOtherIncomeRequest request,
        CancellationToken cancellationToken);
}
