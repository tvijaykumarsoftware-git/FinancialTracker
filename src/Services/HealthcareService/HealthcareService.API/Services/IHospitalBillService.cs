using HealthcareService.API.Contracts;

namespace HealthcareService.API.Services;

public interface IHospitalBillService
{
    Task<IReadOnlyList<MedicalExpenseResponse>> GetByUserAsync(Guid userId, CancellationToken cancellationToken);
    Task<MedicalExpenseResponse?> GetByIdAsync(Guid userId, Guid billId, CancellationToken cancellationToken);
    Task<MedicalExpenseResponse> CreateAsync(Guid userId, CreateMedicalExpenseRequest request, CancellationToken cancellationToken);
    Task<MedicalExpenseResponse?> UpdateAsync(Guid userId, Guid billId, UpdateMedicalExpenseRequest request, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid userId, Guid billId, CancellationToken cancellationToken);
}
