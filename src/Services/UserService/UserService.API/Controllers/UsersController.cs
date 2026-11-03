using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using UserService.API.Contracts;
using UserService.API.Services;

namespace UserService.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public sealed class UsersController(IAuthService authService) : ControllerBase
{
    /// <summary>Creates an account and returns a short-lived access token.</summary>
    [HttpPost("register")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status409Conflict)]
    public async Task<ActionResult<AuthResponse>> Register(
        RegisterRequest request,
        CancellationToken cancellationToken)
    {
        if (string.IsNullOrWhiteSpace(request.FullName))
        {
            return BadRequest(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                ["fullName"] = ["Enter your full name."]
            })
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Full name is required."
            });
        }

        var nameParts = request.FullName.Trim().Split(' ', 2, StringSplitOptions.RemoveEmptyEntries);
        if (nameParts.Any(part => part.Length > 100))
        {
            return BadRequest(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                ["fullName"] = ["Each part of the name must be 100 characters or fewer."]
            })
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Full name is too long."
            });
        }

        if (request.Password.Any(char.IsWhiteSpace)
            || !request.Password.Any(char.IsUpper)
            || !request.Password.Any(char.IsLower)
            || !request.Password.Any(char.IsDigit))
        {
            return BadRequest(new ValidationProblemDetails(new Dictionary<string, string[]>
            {
                ["password"] = ["Use at least 12 characters with uppercase and lowercase letters and a number."]
            })
            {
                Status = StatusCodes.Status400BadRequest,
                Title = "Password does not meet the requirements."
            });
        }

        var response = await authService.RegisterAsync(request, cancellationToken);
        if (response is null)
        {
            return Conflict(new ProblemDetails
            {
                Status = StatusCodes.Status409Conflict,
                Title = "Account already exists",
                Detail = "An account with this email address already exists."
            });
        }

        return CreatedAtAction(nameof(GetUserProfile), new { id = response.UserId }, response);
    }

    /// <summary>Authenticates an account and returns a short-lived access token.</summary>
    [HttpPost("login")]
    [ProducesResponseType<AuthResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<AuthResponse>> Login(
        LoginRequest request,
        CancellationToken cancellationToken)
    {
        var response = await authService.LoginAsync(request, cancellationToken);
        if (response is null)
        {
            return Unauthorized(new ProblemDetails
            {
                Status = StatusCodes.Status401Unauthorized,
                Title = "Invalid credentials",
                Detail = "The email or password is incorrect."
            });
        }

        return Ok(response);
    }

    /// <summary>Returns the profile for the authenticated account.</summary>
    [Authorize]
    [HttpGet("{id:guid}")]
    [ProducesResponseType<UserProfileResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserProfileResponse>> GetUserProfile(
        Guid id,
        CancellationToken cancellationToken)
    {
        var subject = User.FindFirstValue(JwtRegisteredClaimNames.Sub);
        if (!Guid.TryParse(subject, out var authenticatedUserId))
        {
            return Unauthorized();
        }

        if (authenticatedUserId != id)
        {
            return Forbid();
        }

        var profile = await authService.GetProfileAsync(id, cancellationToken);
        return profile is null ? NotFound() : Ok(profile);
    }
}
