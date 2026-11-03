namespace HealthcareService.API.Models;

public sealed class HospitalBill
{
    public Guid HospitalBillId { get; set; }
    public Guid UserId { get; set; }
    public required string HospitalName { get; set; }
    public string? DoctorName { get; set; }
    public required string PatientDetail { get; set; }
    public DateOnly BillDate { get; set; }
    public decimal TotalAmount { get; set; }
    public decimal InsuranceClaimedAmount { get; set; }
    public decimal OutOfPocketPaid { get; set; }
    public string PaidStatus { get; set; } = "Pending";
}
