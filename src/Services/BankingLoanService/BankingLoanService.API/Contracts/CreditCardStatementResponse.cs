namespace BankingLoanService.API.Contracts;

/// <summary>Credit card statement details returned by the API.</summary>
public sealed record CreditCardStatementResponse(
    Guid CardId,
    Guid UserId,
    string IssuerName,
    decimal StatementBalance,
    decimal MinimumDue,
    DateOnly DueDate,
    decimal CreditLimit);
