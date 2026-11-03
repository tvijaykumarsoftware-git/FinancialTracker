using System.ComponentModel.DataAnnotations;

namespace BankingLoanService.API.Contracts;

/// <summary>Fields required to record a debit transaction.</summary>
public sealed record CreateDebitTransactionRequest
{
    /// <summary>Bank account charged for the transaction.</summary>
    public Guid AccountId { get; init; }

    /// <summary>Date on which the transaction occurred.</summary>
    public DateOnly TransactionDate { get; init; }

    /// <summary>Merchant or transaction description.</summary>
    [Required, StringLength(150)]
    public required string MerchantName { get; init; }

    /// <summary>Transaction amount.</summary>
    [Range(typeof(decimal), "0.01", "9999999999999999.99")]
    public decimal Amount { get; init; }

    /// <summary>Transaction category.</summary>
    [Required, StringLength(50)]
    public required string Category { get; init; }
}
