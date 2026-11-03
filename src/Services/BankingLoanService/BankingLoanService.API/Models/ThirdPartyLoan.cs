namespace BankingLoanService.API.Models;

public sealed class ThirdPartyLoan
{
    public Guid LoanId { get; set; }
    public Guid UserId { get; set; }
    public required string AppName { get; set; }
    public required string LoanType { get; set; }
    public decimal Balance { get; set; }
    public decimal MonthlyEmi { get; set; }
    public DateOnly DueDate { get; set; }
}
