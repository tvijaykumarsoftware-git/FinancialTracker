using CreditScoreService.API.Database;
using CreditScoreService.API.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("CreditScoreDatabase")
    ?? throw new InvalidOperationException("ConnectionStrings:CreditScoreDatabase must be configured.");

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler(options => options.AllowStatusCode404Response = true);
builder.Services.AddControllers();
builder.Services.AddDbContext<CreditScoreDbContext>(options => options.UseSqlServer(connectionString));
builder.Services.AddScoped<ICreditScoreService, CreditScoreService.API.Services.CreditScoreService>();

var app = builder.Build();

app.UseExceptionHandler();
app.UseStatusCodePages();
app.MapControllers();

await using (var scope = app.Services.CreateAsyncScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<CreditScoreDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
    await dbContext.Database.ExecuteSqlRawAsync(
        """
        IF OBJECT_ID(N'dbo.CreditScoreReports', N'U') IS NULL
        BEGIN
            CREATE TABLE dbo.CreditScoreReports (
                ReportId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_CreditScoreReports PRIMARY KEY DEFAULT NEWID(),
                UserId UNIQUEIDENTIFIER NOT NULL,
                BureauName NVARCHAR(50) NOT NULL,
                CreditScore INT NOT NULL,
                ReportDate DATE NOT NULL,
                SummaryNotes NVARCHAR(MAX) NULL
            );
            CREATE INDEX IX_CreditScoreReports_UserId ON dbo.CreditScoreReports(UserId);
        END;

        IF OBJECT_ID(N'dbo.OtherFinancialSources', N'U') IS NULL
        BEGIN
            CREATE TABLE dbo.OtherFinancialSources (
                SourceId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_OtherFinancialSources PRIMARY KEY DEFAULT NEWID(),
                UserId UNIQUEIDENTIFIER NOT NULL,
                SourceName NVARCHAR(100) NOT NULL,
                Category NVARCHAR(50) NOT NULL,
                Amount DECIMAL(18,2) NOT NULL,
                TransactionDate DATE NOT NULL
            );
            CREATE INDEX IX_OtherFinancialSources_UserId ON dbo.OtherFinancialSources(UserId);
        END;
        """);
}

app.Run();
