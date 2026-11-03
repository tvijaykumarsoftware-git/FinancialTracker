namespace BankingLoanService.API.Contracts;

/// <summary>Informal debt details returned by the API.</summary>
public sealed record InformalDebtResponse(
    Guid DebtId,
    Guid UserId,
    string LenderName,
    string Notes,
    decimal OriginalAmount,
    decimal RemainingBalance,
    DateOnly TargetRepaymentDate);
