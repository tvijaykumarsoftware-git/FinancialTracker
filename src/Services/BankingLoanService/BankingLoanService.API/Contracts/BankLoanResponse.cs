namespace BankingLoanService.API.Contracts;

/// <summary>Bank loan details returned by the API.</summary>
public sealed record BankLoanResponse(
    Guid LoanId,
    Guid UserId,
    string Lender,
    string Type,
    decimal InterestRate,
    decimal MonthlyEmi,
    decimal PrincipalRemaining,
    decimal YearsRemaining,
    DateTimeOffset CreatedAt);
