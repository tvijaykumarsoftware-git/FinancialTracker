using BankingLoanService.API.Contracts;
using BankingLoanService.API.Database;
using BankingLoanService.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankingLoanService.API.Controllers;

[ApiController]
[Route("api/banking/[controller]")]
public sealed class BankAccountsController(BankingDbContext dbContext) : ControllerBase
{
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IReadOnlyList<BankAccountResponse>>> GetBankAccounts(Guid userId, CancellationToken cancellationToken)
    {
        var accounts = await dbContext.BankAccounts
            .AsNoTracking()
            .Where(account => account.UserId == userId)
            .OrderByDescending(account => account.CreatedAt)
            .ToListAsync(cancellationToken);

        return Ok(accounts.Select(Map).ToList());
    }

    [HttpGet("{bankAccountId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<BankAccountResponse>> GetBankAccount(
        Guid userId,
        Guid bankAccountId,
        CancellationToken cancellationToken)
    {
        var account = await dbContext.BankAccounts
            .AsNoTracking()
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.BankAccountId == bankAccountId,
                cancellationToken);

        return account is null ? NotFound() : Ok(Map(account));
    }

    [HttpPost("user/{userId:guid}")]
    public async Task<ActionResult<BankAccountResponse>> CreateBankAccount(
        Guid userId,
        CreateBankAccountRequest request,
        CancellationToken cancellationToken)
    {
        var account = new BankAccount
        {
            UserId = userId,
            BankName = request.BankName.Trim(),
            AccountType = request.AccountType.Trim(),
            LastFour = request.LastFour,
            Balance = request.Balance,
            IFSC = request.IFSC.Trim().ToUpperInvariant(),
            CreatedAt = DateTime.UtcNow
        };

        dbContext.BankAccounts.Add(account);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = Map(account);
        return CreatedAtAction(nameof(GetBankAccount), new { userId, bankAccountId = account.BankAccountId }, response);
    }

    [HttpPut("{bankAccountId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<BankAccountResponse>> UpdateBankAccount(
        Guid userId,
        Guid bankAccountId,
        UpdateBankAccountRequest request,
        CancellationToken cancellationToken)
    {
        var account = await dbContext.BankAccounts
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.BankAccountId == bankAccountId,
                cancellationToken);

        if (account is null)
        {
            return NotFound();
        }

        account.BankName = request.BankName.Trim();
        account.AccountType = request.AccountType.Trim();
        account.LastFour = request.LastFour;
        account.Balance = request.Balance;
        account.IFSC = request.IFSC.Trim().ToUpperInvariant();

        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(Map(account));
    }

    [HttpDelete("{bankAccountId:guid}/user/{userId:guid}")]
    public async Task<IActionResult> DeleteBankAccount(
        Guid userId,
        Guid bankAccountId,
        CancellationToken cancellationToken)
    {
        var account = await dbContext.BankAccounts
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.BankAccountId == bankAccountId,
                cancellationToken);

        if (account is null)
        {
            return NotFound();
        }

        var hasTransactions = await dbContext.DebitTransactions
            .AnyAsync(transaction => transaction.AccountId == bankAccountId, cancellationToken);
        if (hasTransactions)
        {
            return Conflict("This account cannot be deleted while it has debit transactions.");
        }

        dbContext.BankAccounts.Remove(account);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static BankAccountResponse Map(BankAccount account) =>
        new(
            account.BankAccountId,
            account.UserId,
            account.BankName,
            account.AccountType,
            account.LastFour,
            account.Balance,
            account.IFSC,
            new DateTimeOffset(DateTime.SpecifyKind(account.CreatedAt, DateTimeKind.Utc)));
}
