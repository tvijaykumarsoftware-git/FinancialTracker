using HouseholdService.API.Contracts;

namespace HouseholdService.API.Services;

public interface IHouseholdBillService
{
    Task<IReadOnlyList<HouseholdBillResponse>> GetByUserAsync(Guid userId, CancellationToken cancellationToken);
    Task<HouseholdBillResponse?> GetByIdAsync(Guid userId, Guid billId, CancellationToken cancellationToken);
    Task<HouseholdBillResponse> CreateAsync(Guid userId, CreateHouseholdBillRequest request, CancellationToken cancellationToken);
    Task<HouseholdBillResponse?> UpdateAsync(Guid userId, Guid billId, UpdateHouseholdBillRequest request, CancellationToken cancellationToken);
    Task<bool> DeleteAsync(Guid userId, Guid billId, CancellationToken cancellationToken);
}
