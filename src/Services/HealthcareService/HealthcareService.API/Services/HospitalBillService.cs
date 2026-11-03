using HealthcareService.API.Contracts;
using HealthcareService.API.Database;
using HealthcareService.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HealthcareService.API.Services;

public sealed class HospitalBillService(HealthcareDbContext dbContext) : IHospitalBillService
{
    public async Task<IReadOnlyList<MedicalExpenseResponse>> GetByUserAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var bills = await dbContext.HospitalBills
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
        var bill = await dbContext.HospitalBills
            .AsNoTracking()
            .FirstOrDefaultAsync(
                item => item.UserId == userId && item.HospitalBillId == billId,
                cancellationToken);

        return bill is null ? null : Map(bill);
    }

    public async Task<MedicalExpenseResponse> CreateAsync(
        Guid userId,
        CreateMedicalExpenseRequest request,
        CancellationToken cancellationToken)
    {
        var bill = new HospitalBill
        {
            UserId = userId,
            HospitalName = request.ServiceName.Trim(),
            PatientDetail = request.PatientDetail.Trim(),
            BillDate = request.BillDate,
            TotalAmount = request.InsuranceCovered + request.OutOfPocketDue,
            InsuranceClaimedAmount = request.InsuranceCovered,
            OutOfPocketPaid = request.OutOfPocketDue,
            PaidStatus = request.Status
        };

        dbContext.HospitalBills.Add(bill);
        await dbContext.SaveChangesAsync(cancellationToken);
        return Map(bill);
    }

    public async Task<MedicalExpenseResponse?> UpdateAsync(
        Guid userId,
        Guid billId,
        UpdateMedicalExpenseRequest request,
        CancellationToken cancellationToken)
    {
        var bill = await dbContext.HospitalBills.FirstOrDefaultAsync(
            item => item.UserId == userId && item.HospitalBillId == billId,
            cancellationToken);
        if (bill is null)
        {
            return null;
        }

        bill.HospitalName = request.ServiceName.Trim();
        bill.PatientDetail = request.PatientDetail.Trim();
        bill.BillDate = request.BillDate;
        bill.TotalAmount = request.InsuranceCovered + request.OutOfPocketDue;
        bill.InsuranceClaimedAmount = request.InsuranceCovered;
        bill.OutOfPocketPaid = request.OutOfPocketDue;
        bill.PaidStatus = request.Status;

        await dbContext.SaveChangesAsync(cancellationToken);
        return Map(bill);
    }

    public async Task<bool> DeleteAsync(Guid userId, Guid billId, CancellationToken cancellationToken)
    {
        var bill = await dbContext.HospitalBills.FirstOrDefaultAsync(
            item => item.UserId == userId && item.HospitalBillId == billId,
            cancellationToken);
        if (bill is null)
        {
            return false;
        }

        await dbContext.Medications
            .Where(medication => medication.HospitalBillId == billId)
            .ExecuteDeleteAsync(cancellationToken);
        dbContext.HospitalBills.Remove(bill);
        await dbContext.SaveChangesAsync(cancellationToken);
        return true;
    }

    private static MedicalExpenseResponse Map(HospitalBill bill) =>
        new(
            bill.HospitalBillId,
            bill.UserId,
            bill.HospitalName,
            bill.PatientDetail,
            bill.BillDate,
            bill.InsuranceClaimedAmount,
            bill.OutOfPocketPaid,
            bill.PaidStatus);
}
