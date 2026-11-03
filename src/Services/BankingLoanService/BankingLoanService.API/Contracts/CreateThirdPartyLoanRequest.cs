using System.ComponentModel.DataAnnotations;

namespace BankingLoanService.API.Contracts;

/// <summary>Fields required to add an app loan or PayLater balance.</summary>
public sealed record CreateThirdPartyLoanRequest
{
    /// <summary>Fintech application or lender name.</summary>
    [Required, StringLength(100)]
    public required string AppName { get; init; }

    /// <summary>Type of third-party credit.</summary>
    [Required, RegularExpression("^(App Loan|PayLater)$")]
    public required string Type { get; init; }

    /// <summary>Outstanding balance.</summary>
    [Range(typeof(decimal), "0", "9999999999999999.99")]
    public decimal OutstandingBalance { get; init; }

    /// <summary>Next installment amount.</summary>
    [Range(typeof(decimal), "0", "9999999999999999.99")]
    public decimal NextEmi { get; init; }

    /// <summary>Next payment due date.</summary>
    public required DateOnly DueDate { get; init; }
}
