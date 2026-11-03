using System.ComponentModel.DataAnnotations;

namespace BankingLoanService.API.Contracts;

/// <summary>Fields required to add a credit card statement.</summary>
public sealed record CreateCreditCardStatementRequest
{
    /// <summary>Card issuer or card name.</summary>
    [Required, StringLength(100)]
    public required string IssuerName { get; init; }

    /// <summary>Current statement balance.</summary>
    [Range(typeof(decimal), "0", "9999999999999999.99")]
    public decimal StatementBalance { get; init; }

    /// <summary>Minimum payment due for this statement.</summary>
    [Range(typeof(decimal), "0", "9999999999999999.99")]
    public decimal MinimumDue { get; init; }

    /// <summary>Statement payment due date.</summary>
    public required DateOnly DueDate { get; init; }

    /// <summary>Credit card limit.</summary>
    [Range(typeof(decimal), "0.01", "9999999999999999.99")]
    public decimal CreditLimit { get; init; }
}
