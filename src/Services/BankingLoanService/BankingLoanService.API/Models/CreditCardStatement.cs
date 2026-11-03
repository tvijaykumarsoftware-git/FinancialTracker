namespace BankingLoanService.API.Models;

public sealed class CreditCardStatement
{
    public Guid CardId { get; set; }
    public Guid UserId { get; set; }
    public required string IssuerName { get; set; }
    public decimal StatementBalance { get; set; }
    public decimal MinimumDue { get; set; }
    public DateOnly DueDate { get; set; }
    public decimal CreditLimit { get; set; }
}
