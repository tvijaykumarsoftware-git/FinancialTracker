namespace CreditScoreService.API.Models;

public sealed class OtherFinancialSource
{
    public Guid SourceId { get; set; }
    public Guid UserId { get; set; }
    public required string SourceName { get; set; }
    public required string Category { get; set; }
    public decimal Amount { get; set; }
    public DateOnly TransactionDate { get; set; }
}
