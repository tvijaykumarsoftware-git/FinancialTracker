namespace BankingLoanService.API.Models;

public sealed class InformalDebt
{
    public Guid DebtId { get; set; }
    public Guid UserId { get; set; }
    public required string LenderName { get; set; }
    public required string Notes { get; set; }
    public decimal OriginalAmount { get; set; }
    public decimal RemainingBalance { get; set; }
    public DateOnly TargetRepaymentDate { get; set; }
}
