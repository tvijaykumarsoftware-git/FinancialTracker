using System.ComponentModel.DataAnnotations;

namespace CreditScoreService.API.Contracts;

/// <summary>Fields used to update an alternative financial source.</summary>
public sealed record UpdateFinancialSourceRequest
{
    /// <summary>Name of the income or other financial source.</summary>
    [Required, StringLength(100)]
    public required string SourceName { get; init; }

    /// <summary>Financial source category.</summary>
    [Required, StringLength(50)]
    public required string Category { get; init; }

    /// <summary>Source amount.</summary>
    [Range(typeof(decimal), "0.01", "9999999999999999.99")]
    public decimal Amount { get; init; }

    /// <summary>Date of the financial transaction.</summary>
    public required DateOnly TransactionDate { get; init; }
}
