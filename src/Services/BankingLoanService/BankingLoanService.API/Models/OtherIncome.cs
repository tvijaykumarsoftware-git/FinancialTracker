namespace BankingLoanService.API.Models;

public sealed class OtherIncome
{
    public Guid IncomeId { get; set; }
    public Guid UserId { get; set; }
    public required string SourceName { get; set; }
    public decimal Amount { get; set; }
    public required string Frequency { get; set; }
    public required string Category { get; set; }
}
