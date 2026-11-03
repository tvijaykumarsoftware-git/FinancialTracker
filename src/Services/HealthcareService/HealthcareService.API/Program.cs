using HealthcareService.API.Database;
using HealthcareService.API.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("HealthcareDatabase")
    ?? throw new InvalidOperationException("ConnectionStrings:HealthcareDatabase must be configured.");

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler(options => options.AllowStatusCode404Response = true);
builder.Services.AddControllers();
builder.Services.AddDbContext<HealthcareDbContext>(options => options.UseSqlServer(connectionString));
builder.Services.AddScoped<IHospitalBillService, HospitalBillService>();

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();
app.MapControllers();

await using (var scope = app.Services.CreateAsyncScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<HealthcareDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
    await dbContext.Database.ExecuteSqlRawAsync(
        """
        IF OBJECT_ID(N'dbo.HospitalBills', N'U') IS NULL
        BEGIN
            CREATE TABLE dbo.HospitalBills (
                HospitalBillId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_HospitalBills PRIMARY KEY DEFAULT NEWID(),
                UserId UNIQUEIDENTIFIER NOT NULL,
                HospitalName NVARCHAR(200) NOT NULL,
                DoctorName NVARCHAR(150) NULL,
                PatientDetail NVARCHAR(300) NOT NULL CONSTRAINT DF_HospitalBills_PatientDetail DEFAULT N'Medical expense',
                BillDate DATE NOT NULL,
                TotalAmount DECIMAL(18,2) NOT NULL,
                InsuranceClaimedAmount DECIMAL(18,2) NOT NULL CONSTRAINT DF_HospitalBills_Insurance DEFAULT 0,
                OutOfPocketPaid DECIMAL(18,2) NOT NULL,
                PaidStatus NVARCHAR(20) NOT NULL CONSTRAINT DF_HospitalBills_PaidStatus DEFAULT N'Pending'
            );
            CREATE INDEX IX_HospitalBills_UserId ON dbo.HospitalBills(UserId);
        END;

        IF COL_LENGTH(N'dbo.HospitalBills', N'PatientDetail') IS NULL
            ALTER TABLE dbo.HospitalBills ADD PatientDetail NVARCHAR(300) NOT NULL
                CONSTRAINT DF_HospitalBills_PatientDetail DEFAULT N'Medical expense' WITH VALUES;
        IF COL_LENGTH(N'dbo.HospitalBills', N'PaidStatus') IS NULL
            ALTER TABLE dbo.HospitalBills ADD PaidStatus NVARCHAR(20) NOT NULL
                CONSTRAINT DF_HospitalBills_PaidStatus DEFAULT N'Pending' WITH VALUES;
        IF NOT EXISTS (
            SELECT 1 FROM sys.indexes
            WHERE name = N'IX_HospitalBills_UserId' AND object_id = OBJECT_ID(N'dbo.HospitalBills'))
            CREATE INDEX IX_HospitalBills_UserId ON dbo.HospitalBills(UserId);

        IF OBJECT_ID(N'dbo.Medications', N'U') IS NULL
        BEGIN
            CREATE TABLE dbo.Medications (
                MedicationId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Medications PRIMARY KEY DEFAULT NEWID(),
                HospitalBillId UNIQUEIDENTIFIER NULL,
                MedicineName NVARCHAR(200) NOT NULL,
                DosageInfo NVARCHAR(100) NULL,
                Cost DECIMAL(18,2) NOT NULL,
                CONSTRAINT FK_Medications_HospitalBills_HospitalBillId
                    FOREIGN KEY (HospitalBillId) REFERENCES dbo.HospitalBills(HospitalBillId)
            );
        END;
        """);
}

app.Run();
