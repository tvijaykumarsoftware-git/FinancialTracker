using CreditScoreService.API.Contracts;
using CreditScoreService.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace CreditScoreService.API.Controllers;

[ApiController]
[Route("api/creditscore/sources")]
public sealed class FinancialSourcesController(ICreditScoreService creditScoreService) : ControllerBase
{
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IReadOnlyList<FinancialSourceResponse>>> GetSources(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var sources = await creditScoreService.GetSourcesAsync(userId, cancellationToken);
        return Ok(sources);
    }

    [HttpGet("{sourceId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<FinancialSourceResponse>> GetSource(
        Guid userId,
        Guid sourceId,
        CancellationToken cancellationToken)
    {
        var source = await creditScoreService.GetSourceAsync(userId, sourceId, cancellationToken);
        return source is null ? NotFound() : Ok(source);
    }

    [HttpPost("user/{userId:guid}")]
    public async Task<ActionResult<FinancialSourceResponse>> CreateSource(
        Guid userId,
        CreateFinancialSourceRequest request,
        CancellationToken cancellationToken)
    {
        var source = await creditScoreService.CreateSourceAsync(userId, request, cancellationToken);
        return CreatedAtAction(nameof(GetSource), new { userId, sourceId = source.Id }, source);
    }

    [HttpPut("{sourceId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<FinancialSourceResponse>> UpdateSource(
        Guid userId,
        Guid sourceId,
        UpdateFinancialSourceRequest request,
        CancellationToken cancellationToken)
    {
        var source = await creditScoreService.UpdateSourceAsync(userId, sourceId, request, cancellationToken);
        return source is null ? NotFound() : Ok(source);
    }

    [HttpDelete("{sourceId:guid}/user/{userId:guid}")]
    public async Task<IActionResult> DeleteSource(
        Guid userId,
        Guid sourceId,
        CancellationToken cancellationToken)
    {
        var deleted = await creditScoreService.DeleteSourceAsync(userId, sourceId, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
