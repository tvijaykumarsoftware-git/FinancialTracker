namespace CreditScoreService.API.Models;

public sealed class CreditScoreReport
{
    public Guid ReportId { get; set; }
    public Guid UserId { get; set; }
    public required string BureauName { get; set; }
    public int CreditScore { get; set; }
    public DateOnly ReportDate { get; set; }
    public string? SummaryNotes { get; set; }
}
