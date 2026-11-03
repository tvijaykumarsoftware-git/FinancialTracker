using System.ComponentModel.DataAnnotations;

namespace BankingLoanService.API.Contracts;

/// <summary>Fields used to update an existing medical bill.</summary>
public sealed record UpdateMedicalExpenseRequest
{
    /// <summary>Hospital, clinic, or pharmacy name.</summary>
    [Required, StringLength(100)]
    public required string ServiceName { get; init; }

    /// <summary>Patient name or medical expense description.</summary>
    [Required, StringLength(255)]
    public required string PatientDetail { get; init; }

    /// <summary>Date on the medical bill.</summary>
    public required DateOnly BillDate { get; init; }

    /// <summary>Amount covered or claimed through insurance.</summary>
    [Range(typeof(decimal), "0", "9999999999999999.99")]
    public decimal InsuranceCovered { get; init; }

    /// <summary>Out-of-pocket amount for the bill.</summary>
    [Range(typeof(decimal), "0", "9999999999999999.99")]
    public decimal OutOfPocketDue { get; init; }

    /// <summary>Payment status, either Paid or Pending.</summary>
    [Required, RegularExpression("^(Paid|Pending)$")]
    public required string Status { get; init; }
}
