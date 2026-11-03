using System.ComponentModel.DataAnnotations;

namespace BankingLoanService.API.Contracts;

/// <summary>Amount to apply toward an informal debt balance.</summary>
public sealed record RecordInformalDebtPaybackRequest
{
    /// <summary>Repayment amount.</summary>
    [Range(typeof(decimal), "0.01", "9999999999999999.99")]
    public decimal Amount { get; init; }
}
