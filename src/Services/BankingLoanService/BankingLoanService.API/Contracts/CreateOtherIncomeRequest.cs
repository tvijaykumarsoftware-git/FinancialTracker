using System.ComponentModel.DataAnnotations;

namespace BankingLoanService.API.Contracts;

/// <summary>Fields required to record an additional income source.</summary>
public sealed record CreateOtherIncomeRequest
{
    /// <summary>Name of the income source.</summary>
    [Required, StringLength(100)]
    public required string SourceName { get; init; }

    /// <summary>Income amount.</summary>
    [Range(typeof(decimal), "0.01", "9999999999999999.99")]
    public decimal Amount { get; init; }

    /// <summary>Income frequency, such as Monthly or Quarterly.</summary>
    [Required, StringLength(50)]
    public required string Frequency { get; init; }

    /// <summary>Income category, such as Side Hustle or Investments.</summary>
    [Required, StringLength(50)]
    public required string Category { get; init; }
}
