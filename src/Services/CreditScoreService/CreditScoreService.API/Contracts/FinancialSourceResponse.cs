namespace CreditScoreService.API.Contracts;

/// <summary>Alternative financial source returned by the API.</summary>
public sealed record FinancialSourceResponse(
    Guid Id,
    Guid UserId,
    string SourceName,
    string Category,
    decimal Amount,
    DateOnly TransactionDate);
