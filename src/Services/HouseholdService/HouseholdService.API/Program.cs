using HouseholdService.API.Database;
using HouseholdService.API.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("HouseholdDatabase")
    ?? throw new InvalidOperationException("ConnectionStrings:HouseholdDatabase must be configured.");

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler(options => options.AllowStatusCode404Response = true);
builder.Services.AddControllers();
builder.Services.AddDbContext<HouseholdDbContext>(options => options.UseSqlServer(connectionString));
builder.Services.AddScoped<IHouseholdBillService, HouseholdBillService>();

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();
app.MapControllers();

await using (var scope = app.Services.CreateAsyncScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<HouseholdDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
    await dbContext.Database.ExecuteSqlRawAsync(
        """
        IF OBJECT_ID(N'dbo.HouseholdBills', N'U') IS NULL
        BEGIN
            CREATE TABLE dbo.HouseholdBills (
                BillId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_HouseholdBills PRIMARY KEY DEFAULT NEWID(),
                UserId UNIQUEIDENTIFIER NOT NULL,
                Category NVARCHAR(50) NOT NULL,
                ProviderName NVARCHAR(150) NOT NULL,
                ConsumerNumber NVARCHAR(100) NOT NULL CONSTRAINT DF_HouseholdBills_ConsumerNumber DEFAULT N'',
                Amount DECIMAL(18,2) NOT NULL,
                DueDate DATE NOT NULL,
                PaidStatus NVARCHAR(20) NOT NULL CONSTRAINT DF_HouseholdBills_PaidStatus DEFAULT N'Pending',
                PaidOn DATETIME2 NULL
            );
            CREATE INDEX IX_HouseholdBills_UserId ON dbo.HouseholdBills(UserId);
        END;
        """);
}

app.Run();
