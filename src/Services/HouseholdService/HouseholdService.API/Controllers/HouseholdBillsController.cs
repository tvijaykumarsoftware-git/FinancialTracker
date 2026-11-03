using HouseholdService.API.Contracts;
using HouseholdService.API.Services;
using Microsoft.AspNetCore.Mvc;

namespace HouseholdService.API.Controllers;

[ApiController]
[Route("api/household/[controller]")]
public sealed class BillsController(IHouseholdBillService householdBillService) : ControllerBase
{
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IReadOnlyList<HouseholdBillResponse>>> GetBills(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var bills = await householdBillService.GetByUserAsync(userId, cancellationToken);
        return Ok(bills);
    }

    [HttpGet("{billId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<HouseholdBillResponse>> GetBill(
        Guid userId,
        Guid billId,
        CancellationToken cancellationToken)
    {
        var bill = await householdBillService.GetByIdAsync(userId, billId, cancellationToken);
        return bill is null ? NotFound() : Ok(bill);
    }

    [HttpPost("user/{userId:guid}")]
    public async Task<ActionResult<HouseholdBillResponse>> CreateBill(
        Guid userId,
        CreateHouseholdBillRequest request,
        CancellationToken cancellationToken)
    {
        var bill = await householdBillService.CreateAsync(userId, request, cancellationToken);
        return CreatedAtAction(nameof(GetBill), new { userId, billId = bill.Id }, bill);
    }

    [HttpPut("{billId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<HouseholdBillResponse>> UpdateBill(
        Guid userId,
        Guid billId,
        UpdateHouseholdBillRequest request,
        CancellationToken cancellationToken)
    {
        var bill = await householdBillService.UpdateAsync(userId, billId, request, cancellationToken);
        return bill is null ? NotFound() : Ok(bill);
    }

    [HttpDelete("{billId:guid}/user/{userId:guid}")]
    public async Task<IActionResult> DeleteBill(
        Guid userId,
        Guid billId,
        CancellationToken cancellationToken)
    {
        var deleted = await householdBillService.DeleteAsync(userId, billId, cancellationToken);
        return deleted ? NoContent() : NotFound();
    }
}
