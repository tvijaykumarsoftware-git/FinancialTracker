using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using UserService.API.Contracts;
using UserService.API.Database;
using UserService.API.Models;

namespace UserService.API.Services;

public sealed class AuthService(
    FinancialTrackerDbContext dbContext,
    IPasswordHasher<UserAccount> passwordHasher,
    IConfiguration configuration) : IAuthService
{
    public async Task<AuthResponse?> RegisterAsync(
        RegisterRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        if (await dbContext.Users.AnyAsync(user => user.Email == normalizedEmail, cancellationToken))
        {
            return null;
        }

        var nameParts = request.FullName.Trim().Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
        if (nameParts.Length == 0)
        {
            return null;
        }

        var user = new UserAccount
        {
            UserId = Guid.NewGuid(),
            FirstName = nameParts[0],
            LastName = nameParts.Length > 1 ? nameParts[1] : string.Empty,
            Email = normalizedEmail,
            PhoneNumber = string.Empty,
            CreatedAt = DateTime.UtcNow
        };
        user.PasswordHash = passwordHasher.HashPassword(user, request.Password);

        dbContext.Users.Add(user);
        try
        {
            await dbContext.SaveChangesAsync(cancellationToken);
        }
        catch (DbUpdateException)
        {
            if (await dbContext.Users.AnyAsync(account => account.Email == normalizedEmail, cancellationToken))
            {
                return null;
            }

            throw;
        }

        return CreateAuthResponse(user);
    }

    public async Task<AuthResponse?> LoginAsync(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var normalizedEmail = request.Email.Trim().ToLowerInvariant();
        var user = await dbContext.Users.SingleOrDefaultAsync(
            account => account.Email == normalizedEmail,
            cancellationToken);

        if (user?.PasswordHash is null)
        {
            return null;
        }

        var verificationResult = passwordHasher.VerifyHashedPassword(user, user.PasswordHash, request.Password);
        if (verificationResult == PasswordVerificationResult.Failed)
        {
            return null;
        }

        if (verificationResult == PasswordVerificationResult.SuccessRehashNeeded)
        {
            user.PasswordHash = passwordHasher.HashPassword(user, request.Password);
            await dbContext.SaveChangesAsync(cancellationToken);
        }

        return CreateAuthResponse(user);
    }

    public async Task<UserProfileResponse?> GetProfileAsync(
        Guid userId,
        CancellationToken cancellationToken)
    {
        var user = await dbContext.Users.AsNoTracking()
            .SingleOrDefaultAsync(account => account.UserId == userId, cancellationToken);

        return user is null
            ? null
            : new UserProfileResponse(
                user.UserId,
                user.FirstName,
                user.LastName,
                user.Email,
                user.PhoneNumber,
                new DateTimeOffset(DateTime.SpecifyKind(user.CreatedAt, DateTimeKind.Utc)));
    }

    private AuthResponse CreateAuthResponse(UserAccount user)
    {
        var issuer = configuration["Jwt:Issuer"]!;
        var audience = configuration["Jwt:Audience"]!;
        var expiresAt = DateTimeOffset.UtcNow.AddMinutes(
            configuration.GetValue<int>("Jwt:ExpirationMinutes"));
        var claims = new[]
        {
            new Claim(JwtRegisteredClaimNames.Sub, user.UserId.ToString()),
            new Claim(JwtRegisteredClaimNames.Email, user.Email),
            new Claim(JwtRegisteredClaimNames.Name, $"{user.FirstName} {user.LastName}".Trim()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };
        var signingKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(configuration["Jwt:SigningKey"]!));
        var credentials = new SigningCredentials(signingKey, SecurityAlgorithms.HmacSha256);
        var token = new JwtSecurityToken(
            issuer,
            audience,
            claims,
            expires: expiresAt.UtcDateTime,
            signingCredentials: credentials);
        var accessToken = new JwtSecurityTokenHandler().WriteToken(token);

        return new AuthResponse(
            user.UserId,
            $"{user.FirstName} {user.LastName}".Trim(),
            user.Email,
            accessToken,
            expiresAt);
    }
}
