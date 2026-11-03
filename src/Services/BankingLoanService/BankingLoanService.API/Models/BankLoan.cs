namespace BankingLoanService.API.Models;

public sealed class BankLoan
{
    public Guid LoanId { get; set; }
    public Guid UserId { get; set; }
    public required string LoanType { get; set; }
    public required string Lender { get; set; }
    public decimal InterestRate { get; set; }
    public decimal MonthlyEmi { get; set; }
    public decimal PrincipalRemaining { get; set; }
    public decimal YearsRemaining { get; set; }
    public DateTime CreatedAt { get; set; }
}
