namespace HealthcareService.API.Contracts;

/// <summary>Medical expense details returned by the API.</summary>
public sealed record MedicalExpenseResponse(
    Guid Id,
    Guid UserId,
    string ServiceName,
    string PatientDetail,
    DateOnly BillDate,
    decimal InsuranceCovered,
    decimal OutOfPocketDue,
    string Status);
