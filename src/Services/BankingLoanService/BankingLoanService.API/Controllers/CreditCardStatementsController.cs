using BankingLoanService.API.Contracts;
using BankingLoanService.API.Database;
using BankingLoanService.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BankingLoanService.API.Controllers;

[ApiController]
[Route("api/banking/[controller]")]
public sealed class CreditCardStatementsController(BankingDbContext dbContext) : ControllerBase
{
    [HttpGet("user/{userId:guid}")]
    public async Task<ActionResult<IReadOnlyList<CreditCardStatementResponse>>> GetStatements(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var statements = await dbContext.CreditCardStatements
            .AsNoTracking()
            .Where(statement => statement.UserId == userId)
            .OrderBy(statement => statement.DueDate)
            .ThenBy(statement => statement.IssuerName)
            .ToListAsync(cancellationToken);

        return Ok(statements.Select(Map).ToList());
    }

    [HttpGet("{cardId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<CreditCardStatementResponse>> GetStatement(
        Guid userId,
        Guid cardId,
        CancellationToken cancellationToken)
    {
        var statement = await dbContext.CreditCardStatements
            .AsNoTracking()
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.CardId == cardId,
                cancellationToken);

        return statement is null ? NotFound() : Ok(Map(statement));
    }

    [HttpPost("user/{userId:guid}")]
    public async Task<ActionResult<CreditCardStatementResponse>> CreateStatement(
        Guid userId,
        CreateCreditCardStatementRequest request,
        CancellationToken cancellationToken)
    {
        if (request.MinimumDue > request.StatementBalance)
        {
            ModelState.AddModelError(
                nameof(request.MinimumDue),
                "Minimum due cannot exceed the statement balance.");
            return ValidationProblem(ModelState);
        }

        var statement = new CreditCardStatement
        {
            UserId = userId,
            IssuerName = request.IssuerName.Trim(),
            StatementBalance = request.StatementBalance,
            MinimumDue = request.MinimumDue,
            DueDate = request.DueDate,
            CreditLimit = request.CreditLimit
        };

        dbContext.CreditCardStatements.Add(statement);
        await dbContext.SaveChangesAsync(cancellationToken);

        var response = Map(statement);
        return CreatedAtAction(
            nameof(GetStatement),
            new { userId, cardId = statement.CardId },
            response);
    }

    [HttpPut("{cardId:guid}/user/{userId:guid}")]
    public async Task<ActionResult<CreditCardStatementResponse>> UpdateStatement(
        Guid userId,
        Guid cardId,
        CreateCreditCardStatementRequest request,
        CancellationToken cancellationToken)
    {
        if (request.MinimumDue > request.StatementBalance)
        {
            ModelState.AddModelError(
                nameof(request.MinimumDue),
                "Minimum due cannot exceed the statement balance.");
            return ValidationProblem(ModelState);
        }

        var statement = await dbContext.CreditCardStatements
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.CardId == cardId,
                cancellationToken);
        if (statement is null)
        {
            return NotFound();
        }

        statement.IssuerName = request.IssuerName.Trim();
        statement.StatementBalance = request.StatementBalance;
        statement.MinimumDue = request.MinimumDue;
        statement.DueDate = request.DueDate;
        statement.CreditLimit = request.CreditLimit;

        await dbContext.SaveChangesAsync(cancellationToken);
        return Ok(Map(statement));
    }

    [HttpDelete("{cardId:guid}/user/{userId:guid}")]
    public async Task<IActionResult> DeleteStatement(
        Guid userId,
        Guid cardId,
        CancellationToken cancellationToken)
    {
        var statement = await dbContext.CreditCardStatements
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.CardId == cardId,
                cancellationToken);
        if (statement is null)
        {
            return NotFound();
        }

        dbContext.CreditCardStatements.Remove(statement);
        await dbContext.SaveChangesAsync(cancellationToken);
        return NoContent();
    }

    private static CreditCardStatementResponse Map(CreditCardStatement statement) =>
        new(
            statement.CardId,
            statement.UserId,
            statement.IssuerName,
            statement.StatementBalance,
            statement.MinimumDue,
            statement.DueDate,
            statement.CreditLimit);
}
