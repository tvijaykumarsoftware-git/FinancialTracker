namespace BankingLoanService.API.Contracts;

/// <summary>Additional income source details returned by the API.</summary>
public sealed record OtherIncomeResponse(
    Guid IncomeId,
    Guid UserId,
    string SourceName,
    decimal Amount,
    string Frequency,
    string Category);
