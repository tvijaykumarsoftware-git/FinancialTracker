using HouseholdService.API.Contracts;
using HouseholdService.API.Database;
using HouseholdService.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HouseholdService.API.Services;

public sealed class HouseholdBillService(HouseholdDbContext dbContext) : IHouseholdBillService
{
    public async Task<IReadOnlyList<HouseholdBillResponse>> GetByUserAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var bills = await dbContext.HouseholdBills
            .AsNoTracking()
            .Where(bill => bill.UserId == userId)
            .OrderBy(bill => bill.DueDate)
            .ToListAsync(cancellationToken);

        return bills.Select(Map).ToList();
    }

    public async Task<HouseholdBillResponse?> GetByIdAsync(
        Guid userId,
        Guid billId,
        CancellationToken cancellationToken)
    {
        var bill = await dbContext.HouseholdBills
            .AsNoTracking()
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.BillId == billId,
                cancellationToken);

        return bill is null ? null : Map(bill);
    }

    public async Task<HouseholdBillResponse> CreateAsync(
        Guid userId,
        CreateHouseholdBillRequest request,
        CancellationToken cancellationToken)
    {
        var bill = new HouseholdBill
        {
            UserId = userId,
            Category = request.Category.Trim(),
            ProviderName = request.Provider.Trim(),
            ConsumerNumber = request.ConsumerNumber.Trim(),
            Amount = request.Amount,
            DueDate = request.DueDate,
            PaidStatus = "Pending"
        };

        dbContext.HouseholdBills.Add(bill);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Map(bill);
    }

    public async Task<HouseholdBillResponse?> UpdateAsync(
        Guid userId,
        Guid billId,
        UpdateHouseholdBillRequest request,
        CancellationToken cancellationToken)
    {
        var bill = await dbContext.HouseholdBills
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.BillId == billId,
                cancellationToken);
        if (bill is null)
        {
            return null;
        }

        bill.Category = request.Category.Trim();
        bill.ProviderName = request.Provider.Trim();
        bill.ConsumerNumber = request.ConsumerNumber.Trim();
        bill.Amount = request.Amount;
        bill.DueDate = request.DueDate;
        bill.PaidStatus = request.Status;
        bill.PaidOn = request.Status == "Paid" ? bill.PaidOn ?? DateTime.UtcNow : null;

        await dbContext.SaveChangesAsync(cancellationToken);
        return Map(bill);
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid billId, CancellationToken cancellationToken)
    {
        var bill = await dbContext.HouseholdBills
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.BillId == billId,
                cancellationToken);
        if (bill is null)
        {
            return false;
        }

        dbContext.HouseholdBills.Remove(bill);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static HouseholdBillResponse Map(HouseholdBill bill) =>
        new(
            bill.BillId,
            bill.UserId,
            bill.Category,
            bill.ProviderName,
            bill.ConsumerNumber,
            bill.Amount,
            bill.DueDate,
            bill.PaidStatus);
}
