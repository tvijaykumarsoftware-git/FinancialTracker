using System.ComponentModel.DataAnnotations;

namespace UserService.API.Contracts;

/// <summary>Information required to create a FinTrack account.</summary>
public sealed record RegisterRequest
{
    /// <summary>The account holder's full name.</summary>
    [Required, StringLength(201, MinimumLength = 2)]
    public required string FullName { get; init; }

    /// <summary>The account holder's email address.</summary>
    [Required, EmailAddress, StringLength(255)]
    public required string Email { get; init; }

    /// <summary>The password for the new account. Must contain at least 12 characters.</summary>
    [Required, StringLength(128, MinimumLength = 12)]
    public required string Password { get; init; }
}

/// <summary>Credentials used to sign in to a FinTrack account.</summary>
public sealed record LoginRequest
{
    /// <summary>The account holder's email address.</summary>
    [Required, EmailAddress, StringLength(255)]
    public required string Email { get; init; }

    /// <summary>The account password.</summary>
    [Required, StringLength(128)]
    public required string Password { get; init; }
}

/// <summary>Authenticated account information and a short-lived access token.</summary>
public sealed record AuthResponse(
    Guid UserId,
    string FullName,
    string Email,
    string AccessToken,
    DateTimeOffset ExpiresAt);

/// <summary>Profile data returned for the authenticated account.</summary>
public sealed record UserProfileResponse(
    Guid UserId,
    string FirstName,
    string LastName,
    string Email,
    string PhoneNumber,
    DateTimeOffset CreatedAt);
