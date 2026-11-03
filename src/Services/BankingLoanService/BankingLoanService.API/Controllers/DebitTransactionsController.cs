using BankingLoanService.API.Contracts;
using BankingLoanService.API.Database;
using BankingLoanService.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankingLoanService.API.Controllers;

[ApiController]
[Route("api/banking/[controller]")]
public sealed class DebitTransactionsController(BankingDbContext dbContext) : ControllerBase
{
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IReadOnlyList<DebitTransactionResponse>>> GetTransactions(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var transactions = await dbContext.DebitTransactions
            .AsNoTracking()
            .Include(transaction => transaction.BankAccount)
            .Where(transaction => transaction.UserId == userId)
            .OrderByDescending(transaction => transaction.TransactionDate)
            .ThenByDescending(transaction => transaction.TransactionId)
            .ToListAsync(cancellationToken);

        return Ok(transactions.Select(Map).ToList());
    }

    [HttpGet("{transactionId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<DebitTransactionResponse>> GetTransaction(
        Guid userId,
        Guid transactionId,
        CancellationToken cancellationToken)
    {
        var transaction = await dbContext.DebitTransactions
            .AsNoTracking()
            .Include(item => item.BankAccount)
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.TransactionId == transactionId,
                cancellationToken);

        return transaction is null ? NotFound() : Ok(Map(transaction));
    }

    [HttpPost("user/{userId:guid}")]
    public async Task<ActionResult<DebitTransactionResponse>> CreateTransaction(
        Guid userId,
        CreateDebitTransactionRequest request,
        CancellationToken cancellationToken)
    {
        if (request.AccountId == Guid.Empty)
        {
            ModelState.AddModelError(nameof(request.AccountId), "Select a valid bank account.");
            return ValidationProblem(ModelState);
        }

        if (request.TransactionDate == default)
        {
            ModelState.AddModelError(nameof(request.TransactionDate), "Transaction date is required.");
            return ValidationProblem(ModelState);
        }

        var bankAccount = await dbContext.BankAccounts
            .FirstOrDefaultAsync(
                account => account.UserId == userId && account.BankAccountId == request.AccountId,
                cancellationToken);

        if (bankAccount is null)
        {
            return NotFound("The selected bank account was not found for this user.");
        }

        var transaction = new DebitTransaction
        {
            UserId = userId,
            AccountId = bankAccount.BankAccountId,
            BankAccount = bankAccount,
            TransactionDate = request.TransactionDate,
            MerchantName = request.MerchantName.Trim(),
            Amount = request.Amount,
            Category = request.Category.Trim()
        };

        dbContext.DebitTransactions.Add(transaction);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = Map(transaction);
        return CreatedAtAction(
            nameof(GetTransaction),
            new { userId, transactionId = transaction.TransactionId },
            response);
    }

    [HttpPut("{transactionId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<DebitTransactionResponse>> UpdateTransaction(
        Guid userId,
        Guid transactionId,
        CreateDebitTransactionRequest request,
        CancellationToken cancellationToken)
    {
        if (request.AccountId == Guid.Empty)
        {
            ModelState.AddModelError(nameof(request.AccountId), "Select a valid bank account.");
        }

        if (request.TransactionDate == default)
        {
            ModelState.AddModelError(nameof(request.TransactionDate), "Transaction date is required.");
        }

        if (!ModelState.IsValid)
        {
            return ValidationProblem(ModelState);
        }

        var transaction = await dbContext.DebitTransactions
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.TransactionId == transactionId,
                cancellationToken);
        if (transaction is null)
        {
            return NotFound();
        }

        var bankAccount = await dbContext.BankAccounts
            .FirstOrDefaultAsync(
                account => account.UserId == userId && account.BankAccountId == request.AccountId,
                cancellationToken);
        if (bankAccount is null)
        {
            return NotFound("The selected bank account was not found for this user.");
        }

        transaction.AccountId = bankAccount.BankAccountId;
        transaction.BankAccount = bankAccount;
        transaction.TransactionDate = request.TransactionDate;
        transaction.MerchantName = request.MerchantName.Trim();
        transaction.Amount = request.Amount;
        transaction.Category = request.Category.Trim();

        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(Map(transaction));
    }

    [HttpDelete("{transactionId:guid}/user/{userId:guid}")]
    public async Task<IActionResult> DeleteTransaction(
        Guid userId,
        Guid transactionId,
        CancellationToken cancellationToken)
    {
        var transaction = await dbContext.DebitTransactions
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.TransactionId == transactionId,
                cancellationToken);
        if (transaction is null)
        {
            return NotFound();
        }

        dbContext.DebitTransactions.Remove(transaction);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static DebitTransactionResponse Map(DebitTransaction transaction) =>
        new(
            transaction.TransactionId,
            transaction.UserId,
            transaction.AccountId,
            transaction.BankAccount.BankName,
            transaction.TransactionDate,
            transaction.MerchantName,
            transaction.Amount,
            transaction.Category);
}
