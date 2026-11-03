namespace BankingLoanService.API.Contracts;

/// <summary>Bank account details returned by the banking API.</summary>
public sealed record BankAccountResponse(
    Guid BankAccountId,
    Guid UserId,
    string BankName,
    string AccountType,
    string LastFour,
    decimal Balance,
    string IFSC,
    DateTimeOffset CreatedAt);
