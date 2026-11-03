namespace HealthcareService.API.Models;

public sealed class Medication
{
    public Guid MedicationId { get; set; }
    public Guid? HospitalBillId { get; set; }
    public required string MedicineName { get; set; }
    public string? DosageInfo { get; set; }
    public decimal Cost { get; set; }
}
