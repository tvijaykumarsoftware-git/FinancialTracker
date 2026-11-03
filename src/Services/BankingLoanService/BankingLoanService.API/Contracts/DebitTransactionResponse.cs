namespace BankingLoanService.API.Contracts;

/// <summary>Debit transaction details returned by the API.</summary>
public sealed record DebitTransactionResponse(
    Guid TransactionId,
    Guid UserId,
    Guid AccountId,
    string BankAccount,
    DateOnly TransactionDate,
    string MerchantName,
    decimal Amount,
    string Category);
