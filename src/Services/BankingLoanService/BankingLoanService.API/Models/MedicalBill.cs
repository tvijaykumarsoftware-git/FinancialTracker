namespace BankingLoanService.API.Models;

public sealed class MedicalBill
{
    public Guid MedicalBillId { get; set; }
    public Guid UserId { get; set; }
    public required string ProviderName { get; set; }
    public string? DetailDescription { get; set; }
    public DateOnly BillDate { get; set; }
    public decimal? InsuranceCovered { get; set; }
    public decimal OutOfPocketDue { get; set; }
    public required string Status { get; set; }
}
