using CreditScoreService.API.Contracts;
using CreditScoreService.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace CreditScoreService.API.Controllers;

[ApiController]
[Route("api/creditscore")]
public sealed class CreditScoreController(ICreditScoreService creditScoreService) : ControllerBase
{
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<CreditScoreReportResponse>> GetLatestReport(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var report = await creditScoreService.GetLatestReportAsync(userId, cancellationToken);
        return report is null ? NotFound() : Ok(report);
    }

    [HttpGet("reports/user/{userId:guid}")]
    public async Task<ActionResult<IReadOnlyList<CreditScoreReportResponse>>> GetReports(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var reports = await creditScoreService.GetReportsAsync(userId, cancellationToken);
        return Ok(reports);
    }

    [HttpGet("reports/{reportId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<CreditScoreReportResponse>> GetReport(
        Guid userId,
        Guid reportId,
        CancellationToken cancellationToken)
    {
        var report = await creditScoreService.GetReportAsync(userId, reportId, cancellationToken);
        return report is null ? NotFound() : Ok(report);
    }

    [HttpPost("reports/user/{userId:guid}")]
    public async Task<ActionResult<CreditScoreReportResponse>> CreateReport(
        Guid userId,
        CreateCreditScoreReportRequest request,
        CancellationToken cancellationToken)
    {
        var report = await creditScoreService.CreateReportAsync(userId, request, cancellationToken);
        return CreatedAtAction(nameof(GetReport), new { userId, reportId = report.Id }, report);
    }

    [HttpPut("reports/{reportId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<CreditScoreReportResponse>> UpdateReport(
        Guid userId,
        Guid reportId,
        UpdateCreditScoreReportRequest request,
        CancellationToken cancellationToken)
    {
        var report = await creditScoreService.UpdateReportAsync(userId, reportId, request, cancellationToken);
        return report is null ? NotFound() : Ok(report);
    }

    [HttpDelete("reports/{reportId:guid}/user/{userId:guid}")]
    public async Task<IActionResult> DeleteReport(
        Guid userId,
        Guid reportId,
        CancellationToken cancellationToken)
    {
        var deleted = await creditScoreService.DeleteReportAsync(userId, reportId, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
