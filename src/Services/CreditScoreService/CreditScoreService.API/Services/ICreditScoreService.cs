using CreditScoreService.API.Contracts;

namespace CreditScoreService.API.Services;

public interface ICreditScoreService
{
    Task<IReadOnlyList<CreditScoreReportResponse>> GetReportsAsync(Guid userId, CancellationToken cancellationToken);
    Task<CreditScoreReportResponse?> GetLatestReportAsync(Guid userId, CancellationToken cancellationToken);
    Task<CreditScoreReportResponse?> GetReportAsync(Guid userId, Guid reportId, CancellationToken cancellationToken);
    Task<CreditScoreReportResponse> CreateReportAsync(Guid userId, CreateCreditScoreReportRequest request, CancellationToken cancellationToken);
    Task<CreditScoreReportResponse?> UpdateReportAsync(Guid userId, Guid reportId, UpdateCreditScoreReportRequest request, CancellationToken cancellationToken);
    Task<bool> DeleteReportAsync(Guid userId, Guid reportId, CancellationToken cancellationToken);
    Task<IReadOnlyList<FinancialSourceResponse>> GetSourcesAsync(Guid userId, CancellationToken cancellationToken);
    Task<FinancialSourceResponse?> GetSourceAsync(Guid userId, Guid sourceId, CancellationToken cancellationToken);
    Task<FinancialSourceResponse> CreateSourceAsync(Guid userId, CreateFinancialSourceRequest request, CancellationToken cancellationToken);
    Task<FinancialSourceResponse?> UpdateSourceAsync(Guid userId, Guid sourceId, UpdateFinancialSourceRequest request, CancellationToken cancellationToken);
    Task<bool> DeleteSourceAsync(Guid userId, Guid sourceId, CancellationToken cancellationToken);
}
