using System.ComponentModel.DataAnnotations;

namespace HouseholdService.API.Contracts;

/// <summary>Fields required to add a household bill.</summary>
public sealed record CreateHouseholdBillRequest
{
    /// <summary>Bill category, such as electricity or water.</summary>
    [Required, StringLength(50)]
    public required string Category { get; init; }

    /// <summary>Utility provider or bill description.</summary>
    [Required, StringLength(150)]
    public required string Provider { get; init; }

    /// <summary>Optional provider account or consumer reference.</summary>
    [StringLength(100)]
    public string ConsumerNumber { get; init; } = string.Empty;

    /// <summary>Amount due, which must be greater than zero.</summary>
    [Range(typeof(decimal), "0.01", "9999999999999999.99")]
    public required decimal Amount { get; init; }

    /// <summary>Bill due date.</summary>
    public required DateOnly DueDate { get; init; }
}