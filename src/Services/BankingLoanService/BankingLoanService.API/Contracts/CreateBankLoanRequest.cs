using System.ComponentModel.DataAnnotations;

namespace BankingLoanService.API.Contracts;

/// <summary>Fields required to add a bank loan.</summary>
public sealed record CreateBankLoanRequest
{
    /// <summary>Lender or bank name.</summary>
    [Required, StringLength(150)]
    public required string Lender { get; init; }

    /// <summary>Loan type.</summary>
    [Required, RegularExpression("^(Home Loan|Personal Loan|Vehicle Loan|Other)$")]
    public required string Type { get; init; }

    /// <summary>Annual interest rate as a percentage.</summary>
    [Range(typeof(decimal), "0", "999.99")]
    public decimal InterestRate { get; init; }

    /// <summary>Required monthly installment.</summary>
    [Range(typeof(decimal), "0.01", "9999999999999999.99")]
    public decimal MonthlyEmi { get; init; }

    /// <summary>Outstanding principal balance.</summary>
    [Range(typeof(decimal), "0", "9999999999999999.99")]
    public decimal PrincipalRemaining { get; init; }

    /// <summary>Remaining loan duration in years.</summary>
    [Range(typeof(decimal), "0.01", "9999.99")]
    public decimal YearsRemaining { get; init; }
}
