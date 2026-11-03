using BankingLoanService.API.Contracts;
using BankingLoanService.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace BankingLoanService.API.Controllers;

[ApiController]
[Route("api/banking/[controller]")]
public sealed class MedicalExpensesController(IMedicalBillService medicalBillService) : ControllerBase
{
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IReadOnlyList<MedicalExpenseResponse>>> GetBills(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var bills = await medicalBillService.GetByUserAsync(userId, cancellationToken);
        return Ok(bills);
    }

    [HttpGet("{billId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<MedicalExpenseResponse>> GetBill(
        Guid userId,
        Guid billId,
        CancellationToken cancellationToken)
    {
        var bill = await medicalBillService.GetByIdAsync(userId, billId, cancellationToken);
        return bill is null ? NotFound() : Ok(bill);
    }

    [HttpPost("user/{userId:guid}")]
    public async Task<ActionResult<MedicalExpenseResponse>> CreateBill(
        Guid userId,
        CreateMedicalExpenseRequest request,
        CancellationToken cancellationToken)
    {
        if (request.BillDate == default)
        {
            ModelState.AddModelError(nameof(request.BillDate), "A bill date is required.");
        }

        if (request.InsuranceCovered + request.OutOfPocketDue <= 0)
        {
            ModelState.AddModelError(nameof(request.OutOfPocketDue), "The total bill amount must be greater than zero.");
        }

        if (string.IsNullOrWhiteSpace(request.ServiceName))
        {
            ModelState.AddModelError(nameof(request.ServiceName), "A service or provider name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.PatientDetail))
        {
            ModelState.AddModelError(nameof(request.PatientDetail), "A patient detail or expense description is required.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var bill = await medicalBillService.CreateAsync(userId, request, cancellationToken);
        return CreatedAtAction(
            nameof(GetBill),
            new { userId, billId = bill.Id },
            bill);
    }

    [HttpPut("{billId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<MedicalExpenseResponse>> UpdateBill(
        Guid userId,
        Guid billId,
        UpdateMedicalExpenseRequest request,
        CancellationToken cancellationToken)
    {
        if (request.BillDate == default)
        {
            ModelState.AddModelError(nameof(request.BillDate), "A bill date is required.");
        }

        if (request.InsuranceCovered + request.OutOfPocketDue <= 0)
        {
            ModelState.AddModelError(nameof(request.OutOfPocketDue), "The total bill amount must be greater than zero.");
        }

        if (string.IsNullOrWhiteSpace(request.ServiceName))
        {
            ModelState.AddModelError(nameof(request.ServiceName), "A service or provider name is required.");
        }

        if (string.IsNullOrWhiteSpace(request.PatientDetail))
        {
            ModelState.AddModelError(nameof(request.PatientDetail), "A patient detail or expense description is required.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var bill = await medicalBillService.UpdateAsync(userId, billId, request, cancellationToken);
        return bill is null ? NotFound() : Ok(bill);
    }

    [HttpDelete("{billId:guid}/user/{userId:guid}")]
    public async Task<IActionResult> DeleteBill(
        Guid userId,
        Guid billId,
        CancellationToken cancellationToken)
    {
        var deleted = await medicalBillService.DeleteAsync(userId, billId, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
