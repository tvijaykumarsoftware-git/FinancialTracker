using System.ComponentModel.DataAnnotations;

namespace CreditScoreService.API.Contracts;

/// <summary>Fields used to update a saved credit bureau report.</summary>
public sealed record UpdateCreditScoreReportRequest
{
    /// <summary>Name of the reporting credit bureau.</summary>
    [Required, StringLength(50)]
    public required string BureauName { get; init; }

    /// <summary>Credit score reported by the bureau.</summary>
    [Range(0, 1000)]
    public int CreditScore { get; init; }

    /// <summary>Date on which the report was issued.</summary>
    public required DateOnly ReportDate { get; init; }

    /// <summary>Optional explanatory notes for the report.</summary>
    public string? SummaryNotes { get; init; }
}
