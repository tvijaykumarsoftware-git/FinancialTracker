namespace HouseholdService.API.Contracts;

/// <summary>Household bill details returned by the API.</summary>
public sealed record HouseholdBillResponse(
    Guid Id,
    Guid UserId,
    string Category,
    string Provider,
    string ConsumerNumber,
    decimal Amount,
    DateOnly DueDate,
    string Status);