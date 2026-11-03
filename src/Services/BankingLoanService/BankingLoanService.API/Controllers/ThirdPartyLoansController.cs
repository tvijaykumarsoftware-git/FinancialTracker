using BankingLoanService.API.Contracts;
using BankingLoanService.API.Database;
using BankingLoanService.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankingLoanService.API.Controllers;

[ApiController]
[Route("api/banking/[controller]")]
public sealed class ThirdPartyLoansController(BankingDbContext dbContext) : ControllerBase
{
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IReadOnlyList<ThirdPartyLoanResponse>>> GetLoans(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var loans = await dbContext.ThirdPartyLoans
            .AsNoTracking()
            .Where(loan => loan.UserId == userId)
            .OrderBy(loan => loan.DueDate)
            .ThenBy(loan => loan.AppName)
            .ToListAsync(cancellationToken);

        return Ok(loans.Select(Map).ToList());
    }

    [HttpGet("{loanId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<ThirdPartyLoanResponse>> GetLoan(
        Guid userId,
        Guid loanId,
        CancellationToken cancellationToken)
    {
        var loan = await dbContext.ThirdPartyLoans
            .AsNoTracking()
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.LoanId == loanId,
                cancellationToken);

        return loan is null ? NotFound() : Ok(Map(loan));
    }

    [HttpPost("user/{userId:guid}")]
    public async Task<ActionResult<ThirdPartyLoanResponse>> CreateLoan(
        Guid userId,
        CreateThirdPartyLoanRequest request,
        CancellationToken cancellationToken)
    {
        if (request.DueDate == default)
        {
            ModelState.AddModelError(nameof(request.DueDate), "A due date is required.");
            return ValidationProblem(ModelState);
        }

        var loan = new ThirdPartyLoan
        {
            UserId = userId,
            AppName = request.AppName.Trim(),
            LoanType = request.Type,
            Balance = request.OutstandingBalance,
            MonthlyEmi = request.NextEmi,
            DueDate = request.DueDate
        };

        dbContext.ThirdPartyLoans.Add(loan);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = Map(loan);
        return CreatedAtAction(
            nameof(GetLoan),
            new { userId, loanId = loan.LoanId },
            response);
    }

    [HttpPut("{loanId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<ThirdPartyLoanResponse>> UpdateLoan(
        Guid userId,
        Guid loanId,
        CreateThirdPartyLoanRequest request,
        CancellationToken cancellationToken)
    {
        if (request.DueDate == default)
        {
            ModelState.AddModelError(nameof(request.DueDate), "A due date is required.");
            return ValidationProblem(ModelState);
        }

        var loan = await dbContext.ThirdPartyLoans
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.LoanId == loanId,
                cancellationToken);
        if (loan is null)
        {
            return NotFound();
        }

        loan.AppName = request.AppName.Trim();
        loan.LoanType = request.Type;
        loan.Balance = request.OutstandingBalance;
        loan.MonthlyEmi = request.NextEmi;
        loan.DueDate = request.DueDate;

        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(Map(loan));
    }

    [HttpDelete("{loanId:guid}/user/{userId:guid}")]
    public async Task<IActionResult> DeleteLoan(
        Guid userId,
        Guid loanId,
        CancellationToken cancellationToken)
    {
        var loan = await dbContext.ThirdPartyLoans
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.LoanId == loanId,
                cancellationToken);
        if (loan is null)
        {
            return NotFound();
        }

        dbContext.ThirdPartyLoans.Remove(loan);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static ThirdPartyLoanResponse Map(ThirdPartyLoan loan) =>
        new(
            loan.LoanId,
            loan.UserId,
            loan.AppName,
            loan.LoanType,
            loan.Balance,
            loan.MonthlyEmi,
            loan.DueDate);
}
