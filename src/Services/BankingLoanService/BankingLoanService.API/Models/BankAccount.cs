namespace BankingLoanService.API.Models;

public sealed class BankAccount
{
    public Guid BankAccountId { get; set; }
    public Guid UserId { get; set; }
    public required string BankName { get; set; }
    public required string AccountType { get; set; }
    public required string LastFour { get; set; }
    public decimal Balance { get; set; }
    public required string IFSC { get; set; }
    public DateTime CreatedAt { get; set; }
}
