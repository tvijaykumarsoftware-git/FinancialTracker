namespace CreditScoreService.API.Contracts;

/// <summary>Credit bureau report returned by the API.</summary>
public sealed record CreditScoreReportResponse(
    Guid Id,
    Guid UserId,
    string BureauName,
    int CreditScore,
    DateOnly ReportDate,
    string? SummaryNotes);
