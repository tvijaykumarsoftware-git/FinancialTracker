using BankingLoanService.API.Contracts;
using BankingLoanService.API.Database;
using BankingLoanService.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BankingLoanService.API.Services;

public sealed class MedicalBillService(BankingDbContext dbContext) : IMedicalBillService
{
    public async Task<IReadOnlyList<MedicalExpenseResponse>> GetByUserAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var bills = await dbContext.MedicalBills
            .AsNoTracking()
            .Where(bill => bill.UserId == userId)
            .OrderByDescending(bill => bill.BillDate)
            .ToListAsync(cancellationToken);

        return bills.Select(Map).ToList();
    }

    public async Task<MedicalExpenseResponse?> GetByIdAsync(
        Guid userId,
        Guid billId,
        CancellationToken cancellationToken)
    {
        var bill = await dbContext.MedicalBills
            .AsNoTracking()
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.MedicalBillId == billId,
                cancellationToken);

        return bill is null ? null : Map(bill);
    }

    public async Task<MedicalExpenseResponse> CreateAsync(
        Guid userId,
        CreateMedicalExpenseRequest request,
        CancellationToken cancellationToken)
    {
        var bill = new MedicalBill
        {
            UserId = userId,
            ProviderName = request.ServiceName.Trim(),
            DetailDescription = request.PatientDetail.Trim(),
            BillDate = request.BillDate,
            InsuranceCovered = request.InsuranceCovered,
            OutOfPocketDue = request.OutOfPocketDue,
            Status = request.Status
        };

        dbContext.MedicalBills.Add(bill);
        await dbContext.SaveChangesAsync(cancellationToken);

        return Map(bill);
    }

    public async Task<MedicalExpenseResponse?> UpdateAsync(
        Guid userId,
        Guid billId,
        UpdateMedicalExpenseRequest request,
        CancellationToken cancellationToken)
    {
        var bill = await dbContext.MedicalBills.FirstOrDefaultAsync(
            item => item.UserId == userId && item.MedicalBillId == billId,
            cancellationToken);
        if (bill is null)
        {
            return null;
        }

        bill.ProviderName = request.ServiceName.Trim();
        bill.DetailDescription = request.PatientDetail.Trim();
        bill.BillDate = request.BillDate;
        bill.InsuranceCovered = request.InsuranceCovered;
        bill.OutOfPocketDue = request.OutOfPocketDue;
        bill.Status = request.Status;

        await dbContext.SaveChangesAsync(cancellationToken);
        return Map(bill);
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid billId, CancellationToken cancellationToken)
    {
        var bill = await dbContext.MedicalBills.FirstOrDefaultAsync(
            item => item.UserId == userId && item.MedicalBillId == billId,
            cancellationToken);
        if (bill is null)
        {
            return false;
        }

        dbContext.MedicalBills.Remove(bill);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static MedicalExpenseResponse Map(MedicalBill bill) =>
        new(
            bill.MedicalBillId,
            bill.UserId,
            bill.ProviderName,
            bill.DetailDescription ?? string.Empty,
            bill.BillDate,
            bill.InsuranceCovered ?? 0m,
            bill.OutOfPocketDue,
            bill.Status);
}
