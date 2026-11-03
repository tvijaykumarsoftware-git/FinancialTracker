namespace HouseholdService.API.Models;

public sealed class HouseholdBill
{
    public Guid BillId { get; set; }
    public Guid UserId { get; set; }
    public required string Category { get; set; }
    public required string ProviderName { get; set; }
    public string ConsumerNumber { get; set; } = string.Empty;
    public decimal Amount { get; set; }
    public DateOnly DueDate { get; set; }
    public string PaidStatus { get; set; } = "Pending";
    public DateTime? PaidOn { get; set; }
}