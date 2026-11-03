using HealthcareService.API.Contracts;
using HealthcareService.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HealthcareService.API.Controllers;

[ApiController]
[Route("api/healthcare/[controller]")]
public sealed class BillsController(IHospitalBillService hospitalBillService) : ControllerBase
{
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IReadOnlyList<MedicalExpenseResponse>>> GetBills(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var bills = await hospitalBillService.GetByUserAsync(userId, cancellationToken);
        return Ok(bills);
    }

    [HttpGet("{billId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<MedicalExpenseResponse>> GetBill(
        Guid userId,
        Guid billId,
        CancellationToken cancellationToken)
    {
        var bill = await hospitalBillService.GetByIdAsync(userId, billId, cancellationToken);
        return bill is null ? NotFound() : Ok(bill);
    }

    [HttpPost("user/{userId:guid}")]
    public async Task<ActionResult<MedicalExpenseResponse>> CreateBill(
        Guid userId,
        CreateMedicalExpenseRequest request,
        CancellationToken cancellationToken)
    {
        if (request.InsuranceCovered + request.OutOfPocketDue <= 0)
        {
            ModelState.AddModelError(nameof(request.OutOfPocketDue), "The total medical expense must be greater than zero.");
            return ValidationProblem(ModelState);
        }

        var bill = await hospitalBillService.CreateAsync(userId, request, cancellationToken);
        return CreatedAtAction(nameof(GetBill), new { userId, billId = bill.Id }, bill);
    }

    [HttpPut("{billId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<MedicalExpenseResponse>> UpdateBill(
        Guid userId,
        Guid billId,
        UpdateMedicalExpenseRequest request,
        CancellationToken cancellationToken)
    {
        if (request.InsuranceCovered + request.OutOfPocketDue <= 0)
        {
            ModelState.AddModelError(nameof(request.OutOfPocketDue), "The total medical expense must be greater than zero.");
            return ValidationProblem(ModelState);
        }

        var bill = await hospitalBillService.UpdateAsync(userId, billId, request, cancellationToken);
        return bill is null ? NotFound() : Ok(bill);
    }

    [HttpDelete("{billId:guid}/user/{userId:guid}")]
    public async Task<IActionResult> DeleteBill(
        Guid userId,
        Guid billId,
        CancellationToken cancellationToken)
    {
        var deleted = await hospitalBillService.DeleteAsync(userId, billId, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
