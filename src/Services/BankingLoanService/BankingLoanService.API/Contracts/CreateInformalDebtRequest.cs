using System.ComponentModel.DataAnnotations;

namespace BankingLoanService.API.Contracts;

/// <summary>Fields required to record an informal debt.</summary>
public sealed record CreateInformalDebtRequest
{
    /// <summary>Name of the lender.</summary>
    [Required, StringLength(100)]
    public required string LenderName { get; init; }

    /// <summary>Relationship or borrowing notes.</summary>
    [Required, StringLength(255)]
    public required string Notes { get; init; }

    /// <summary>Initial amount borrowed.</summary>
    [Range(typeof(decimal), "0.01", "9999999999999999.99")]
    public decimal OriginalAmount { get; init; }

    /// <summary>Target date to repay the debt.</summary>
    public required DateOnly TargetRepaymentDate { get; init; }
}
