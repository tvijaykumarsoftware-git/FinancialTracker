using Microsoft.AspNetCore.Mvc;

namespace BankingLoanService.API.Controllers;

[ApiController]
[Route("api/banking/[controller]")]
public class DashboardSummaryController : ControllerBase
{
    [HttpGet("user/{userId:guid}")]
    public IActionResult GetBankingAndLoanSummary(Guid userId)
    {
        var response = new
        {
            CreditCardBills = new[]
            {
                new { Bank = "ICICI Bank", CardLastFour = "4321", TotalDue = 12450.00, DueDate = "2026-11-02", MinimumDue = 1200.00 }
            },
            Loans = new[]
            {
                new { Type = "Home Loan", Lender = "SBI Home Finance", Principal = 4500000.00, Outstanding = 3800000.00, EMI = 38500.00 },
                new { Type = "Vehicle Loan", Lender = "HDFC Auto", Principal = 800000.00, Outstanding = 320000.00, EMI = 14200.00 },
                new { Type = "Third Party App (Bajaj Finance)", Lender = "Bajaj Finserv", Principal = 60000.00, Outstanding = 20000.00, EMI = 5000.00 },
                new { Type = "Other Borrow Bill", Lender = "Private Peer Loan", Principal = 50000.00, Outstanding = 15000.00, EMI = 5000.00 }
            }
        };
        return Ok(response);
    }
}