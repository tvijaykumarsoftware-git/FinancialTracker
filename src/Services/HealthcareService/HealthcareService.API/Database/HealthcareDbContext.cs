using HealthcareService.API.Models;
using Microsoft.EntityFrameworkCore;

namespace HealthcareService.API.Database;

public sealed class HealthcareDbContext(DbContextOptions<HealthcareDbContext> options) : DbContext(options)
{
    public DbSet<HospitalBill> HospitalBills => Set<HospitalBill>();
    public DbSet<Medication> Medications => Set<Medication>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var bills = modelBuilder.Entity<HospitalBill>();
        bills.ToTable("HospitalBills");
        bills.HasKey(bill => bill.HospitalBillId);
        bills.Property(bill => bill.HospitalBillId).HasDefaultValueSql("NEWID()");
        bills.Property(bill => bill.UserId).IsRequired();
        bills.HasIndex(bill => bill.UserId);
        bills.Property(bill => bill.HospitalName).HasMaxLength(200).IsRequired();
        bills.Property(bill => bill.DoctorName).HasMaxLength(150);
        bills.Property(bill => bill.PatientDetail).HasMaxLength(300).HasDefaultValue("Medical expense").IsRequired();
        bills.Property(bill => bill.BillDate).HasColumnType("date");
        bills.Property(bill => bill.TotalAmount).HasPrecision(18, 2);
        bills.Property(bill => bill.InsuranceClaimedAmount).HasPrecision(18, 2).HasDefaultValue(0);
        bills.Property(bill => bill.OutOfPocketPaid).HasPrecision(18, 2);
        bills.Property(bill => bill.PaidStatus).HasMaxLength(20).HasDefaultValue("Pending").IsRequired();

        var medications = modelBuilder.Entity<Medication>();
        medications.ToTable("Medications");
        medications.HasKey(medication => medication.MedicationId);
        medications.Property(medication => medication.MedicationId).HasDefaultValueSql("NEWID()");
        medications.Property(medication => medication.MedicineName).HasMaxLength(200).IsRequired();
        medications.Property(medication => medication.DosageInfo).HasMaxLength(100);
        medications.Property(medication => medication.Cost).HasPrecision(18, 2);
        medications.HasOne<HospitalBill>()
            .WithMany()
            .HasForeignKey(medication => medication.HospitalBillId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}
