using BankingLoanService.API.Contracts;
using BankingLoanService.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace BankingLoanService.API.Controllers;

[ApiController]
[Route("api/banking/[controller]")]
public sealed class InformalDebtsController(IInformalDebtService informalDebtService) : ControllerBase
{
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IReadOnlyList<InformalDebtResponse>>> GetDebts(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var debts = await informalDebtService.GetDebtsAsync(userId, cancellationToken);
        return Ok(debts);
    }

    [HttpGet("{debtId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<InformalDebtResponse>> GetDebt(
        Guid userId,
        Guid debtId,
        CancellationToken cancellationToken)
    {
        var debt = await informalDebtService.GetDebtAsync(userId, debtId, cancellationToken);

        return debt is null ? NotFound() : Ok(debt);
    }

    [HttpPost("user/{userId:guid}")]
    public async Task<ActionResult<InformalDebtResponse>> CreateDebt(
        Guid userId,
        CreateInformalDebtRequest request,
        CancellationToken cancellationToken)
    {
        if (request.TargetRepaymentDate == default)
        {
            ModelState.AddModelError(nameof(request.TargetRepaymentDate), "A target repayment date is required.");
            return ValidationProblem(ModelState);
        }

        var response = await informalDebtService.CreateDebtAsync(userId, request, cancellationToken);
        return CreatedAtAction(
            nameof(GetDebt),
            new { userId, debtId = response.DebtId },
            response);
    }

    [HttpPost("{debtId:guid}/user/{userId:guid}/paybacks")]
    public async Task<ActionResult<InformalDebtResponse>> RecordPayback(
        Guid userId,
        Guid debtId,
        RecordInformalDebtPaybackRequest request,
        CancellationToken cancellationToken)
    {
        var result = await informalDebtService.RecordPaybackAsync(
            userId,
            debtId,
            request.Amount,
            cancellationToken);

        if (!result.DebtFound)
        {
            return NotFound();
        }

        if (!result.AmountApplied)
        {
            ModelState.AddModelError(nameof(request.Amount), "Payback amount cannot exceed the remaining balance.");
            return ValidationProblem(ModelState);
        }

        return Ok(result.Debt);
    }
}
