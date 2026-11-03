namespace BankingLoanService.API.Contracts;

/// <summary>Third-party loan details returned by the API.</summary>
public sealed record ThirdPartyLoanResponse(
    Guid LoanId,
    Guid UserId,
    string AppName,
    string Type,
    decimal OutstandingBalance,
    decimal NextEmi,
    DateOnly DueDate);
