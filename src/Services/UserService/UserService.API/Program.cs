using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using UserService.API.Database;
using UserService.API.Models;
using UserService.API.Services;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("UserDatabase")
    ?? throw new InvalidOperationException("ConnectionStrings:UserDatabase must be configured.");
var jwtSigningKey = builder.Configuration["Jwt:SigningKey"]
    ?? throw new InvalidOperationException("Configure Jwt:SigningKey with .NET user-secrets or an environment variable.");
if (Encoding.UTF8.GetByteCount(jwtSigningKey) < 32)
{
    throw new InvalidOperationException("Jwt:SigningKey must contain at least 32 UTF-8 bytes.");
}

var jwtIssuer = builder.Configuration["Jwt:Issuer"]
    ?? throw new InvalidOperationException("Jwt:Issuer must be configured.");
var jwtAudience = builder.Configuration["Jwt:Audience"]
    ?? throw new InvalidOperationException("Jwt:Audience must be configured.");
var jwtExpirationMinutes = builder.Configuration.GetValue<int>("Jwt:ExpirationMinutes");
if (jwtExpirationMinutes is < 5 or > 60)
{
    throw new InvalidOperationException("Jwt:ExpirationMinutes must be between 5 and 60.");
}

builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler(options => options.AllowStatusCode404Response = true);
builder.Services.AddControllers();
builder.Services.AddDbContext<FinancialTrackerDbContext>(options => options.UseSqlServer(connectionString));
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IPasswordHasher<UserAccount>, PasswordHasher<UserAccount>>();
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.MapInboundClaims = false;
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwtIssuer,
            ValidateAudience = true,
            ValidAudience = jwtAudience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSigningKey)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromSeconds(30)
        };
    });
builder.Services.AddAuthorization();

var app = builder.Build();
app.UseExceptionHandler();
app.UseStatusCodePages();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

await using (var scope = app.Services.CreateAsyncScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<FinancialTrackerDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
    await dbContext.Database.ExecuteSqlRawAsync(
        """
        IF OBJECT_ID(N'dbo.Users', N'U') IS NOT NULL
            AND COL_LENGTH(N'dbo.Users', N'UserId') IS NULL
            AND COL_LENGTH(N'dbo.Users', N'user_id') IS NOT NULL
        BEGIN
            IF OBJECT_ID(N'dbo.Users_Legacy', N'U') IS NOT NULL
                THROW 51000, 'Both legacy and current Users tables exist. Resolve the legacy table before starting UserService.', 1;

            EXEC sys.sp_rename N'dbo.Users', N'Users_Legacy';
        END;

        IF OBJECT_ID(N'dbo.Users', N'U') IS NULL
        BEGIN
            CREATE TABLE dbo.Users (
                UserId UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_Users PRIMARY KEY DEFAULT NEWID(),
                FirstName NVARCHAR(100) NOT NULL,
                LastName NVARCHAR(100) NOT NULL,
                Email NVARCHAR(255) NOT NULL,
                PhoneNumber NVARCHAR(20) NOT NULL,
                PasswordHash NVARCHAR(500) NULL,
                CreatedAt DATETIME2 NOT NULL CONSTRAINT DF_Users_CreatedAt DEFAULT GETUTCDATE()
            );
        END;

        IF OBJECT_ID(N'dbo.Users_Legacy', N'U') IS NOT NULL
        BEGIN
            INSERT INTO dbo.Users (UserId, FirstName, LastName, Email, PhoneNumber, PasswordHash, CreatedAt)
            SELECT
                NEWID(),
                LEFT(names.FullName, CHARINDEX(N' ', names.FullName + N' ') - 1),
                CASE
                    WHEN CHARINDEX(N' ', names.FullName) = 0 THEN N''
                    ELSE LTRIM(SUBSTRING(names.FullName, CHARINDEX(N' ', names.FullName) + 1, 200))
                END,
                legacy.email,
                N'',
                legacy.PasswordHash,
                COALESCE(legacy.created_at, GETUTCDATE())
            FROM dbo.Users_Legacy AS legacy
            CROSS APPLY (VALUES (LTRIM(RTRIM(legacy.full_name)))) AS names(FullName);

            EXEC sys.sp_rename N'dbo.Users_Legacy', N'Users_Legacy_Imported';
        END;

        IF COL_LENGTH(N'dbo.Users', N'PasswordHash') IS NULL
            ALTER TABLE dbo.Users ADD PasswordHash NVARCHAR(500) NULL;

        IF NOT EXISTS (
            SELECT 1 FROM sys.indexes
            WHERE name = N'IX_Users_Email' AND object_id = OBJECT_ID(N'dbo.Users'))
            CREATE UNIQUE INDEX IX_Users_Email ON dbo.Users(Email);
        """);
}

app.Run();
