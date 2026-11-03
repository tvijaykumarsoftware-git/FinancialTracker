using BankingLoanService.API.Contracts;
using BankingLoanService.API.Database;
using BankingLoanService.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankingLoanService.API.Controllers;

[ApiController]
[Route("api/banking/[controller]")]
public sealed class BankLoansController(BankingDbContext dbContext) : ControllerBase
{
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IReadOnlyList<BankLoanResponse>>> GetBankLoans(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var loans = await dbContext.BankLoans
            .AsNoTracking()
            .Where(loan => loan.UserId == userId)
            .OrderByDescending(loan => loan.CreatedAt)
            .ToListAsync(cancellationToken);

        return Ok(loans.Select(Map).ToList());
    }

    [HttpGet("{loanId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<BankLoanResponse>> GetBankLoan(
        Guid userId,
        Guid loanId,
        CancellationToken cancellationToken)
    {
        var loan = await dbContext.BankLoans
            .AsNoTracking()
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.LoanId == loanId,
                cancellationToken);

        return loan is null ? NotFound() : Ok(Map(loan));
    }

    [HttpPost("user/{userId:guid}")]
    public async Task<ActionResult<BankLoanResponse>> CreateBankLoan(
        Guid userId,
        CreateBankLoanRequest request,
        CancellationToken cancellationToken)
    {
        var loan = new BankLoan
        {
            UserId = userId,
            Lender = request.Lender.Trim(),
            LoanType = request.Type,
            InterestRate = request.InterestRate,
            MonthlyEmi = request.MonthlyEmi,
            PrincipalRemaining = request.PrincipalRemaining,
            YearsRemaining = request.YearsRemaining,
            CreatedAt = DateTime.UtcNow
        };

        dbContext.BankLoans.Add(loan);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = Map(loan);
        return CreatedAtAction(
            nameof(GetBankLoan),
            new { userId, loanId = loan.LoanId },
            response);
    }

    [HttpPut("{loanId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<BankLoanResponse>> UpdateBankLoan(
        Guid userId,
        Guid loanId,
        CreateBankLoanRequest request,
        CancellationToken cancellationToken)
    {
        var loan = await dbContext.BankLoans
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.LoanId == loanId,
                cancellationToken);
        if (loan is null)
        {
            return NotFound();
        }

        loan.Lender = request.Lender.Trim();
        loan.LoanType = request.Type;
        loan.InterestRate = request.InterestRate;
        loan.MonthlyEmi = request.MonthlyEmi;
        loan.PrincipalRemaining = request.PrincipalRemaining;
        loan.YearsRemaining = request.YearsRemaining;

        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(Map(loan));
    }

    [HttpDelete("{loanId:guid}/user/{userId:guid}")]
    public async Task<IActionResult> DeleteBankLoan(
        Guid userId,
        Guid loanId,
        CancellationToken cancellationToken)
    {
        var loan = await dbContext.BankLoans
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.LoanId == loanId,
                cancellationToken);
        if (loan is null)
        {
            return NotFound();
        }

        dbContext.BankLoans.Remove(loan);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static BankLoanResponse Map(BankLoan loan) =>
        new(
            loan.LoanId,
            loan.UserId,
            loan.Lender,
            loan.LoanType,
            loan.InterestRate,
            loan.MonthlyEmi,
            loan.PrincipalRemaining,
            loan.YearsRemaining,
            new DateTimeOffset(DateTime.SpecifyKind(loan.CreatedAt, DateTimeKind.Utc)));
}
