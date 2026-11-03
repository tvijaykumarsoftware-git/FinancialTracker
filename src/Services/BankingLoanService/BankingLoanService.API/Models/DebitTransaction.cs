namespace BankingLoanService.API.Models;

public sealed class DebitTransaction
{
    public Guid TransactionId { get; set; }
    public Guid UserId { get; set; }
    public Guid AccountId { get; set; }
    public required BankAccount BankAccount { get; set; }
    public DateOnly TransactionDate { get; set; }
    public required string MerchantName { get; set; }
    public decimal Amount { get; set; }
    public required string Category { get; set; }
}
