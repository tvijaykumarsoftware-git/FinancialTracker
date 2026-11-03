using UserService.API.Contracts;

namespace UserService.API.Services;

public interface IAuthService
{
    Task<AuthResponse?> RegisterAsync(RegisterRequest request, CancellationToken cancellationToken);
    Task<AuthResponse?> LoginAsync(LoginRequest request, CancellationToken cancellationToken);
    Task<UserProfileResponse?> GetProfileAsync(Guid userId, CancellationToken cancellationToken);
}
