using BankingLoanService.API.Contracts;
using BankingLoanService.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace BankingLoanService.API.Controllers;

[ApiController]
[Route("api/banking/[controller]")]
public sealed class OtherIncomeController(IOtherIncomeService otherIncomeService) : ControllerBase
{
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IReadOnlyList<OtherIncomeResponse>>> GetIncomeSources(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var sources = await otherIncomeService.GetIncomeSourcesAsync(userId, cancellationToken);
        return Ok(sources);
    }

    [HttpGet("{incomeId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<OtherIncomeResponse>> GetIncomeSource(
        Guid userId,
        Guid incomeId,
        CancellationToken cancellationToken)
    {
        var source = await otherIncomeService.GetIncomeSourceAsync(userId, incomeId, cancellationToken);
        return source is null ? NotFound() : Ok(source);
    }

    [HttpPost("user/{userId:guid}")]
    public async Task<ActionResult<OtherIncomeResponse>> CreateIncomeSource(
        Guid userId,
        CreateOtherIncomeRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.SourceName))
        {
            ModelState.AddModelError(nameof(request.SourceName), "An income source name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Frequency))
        {
            ModelState.AddModelError(nameof(request.Frequency), "An income frequency is required.");
        }

        if (string.IsNullOrWhiteSpace(request.Category))
        {
            ModelState.AddModelError(nameof(request.Category), "An income category is required.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var source = await otherIncomeService.CreateIncomeSourceAsync(userId, request, cancellationToken);
        return CreatedAtAction(
            nameof(GetIncomeSource),
            new { userId, incomeId = source.IncomeId },
            source);
    }
}
