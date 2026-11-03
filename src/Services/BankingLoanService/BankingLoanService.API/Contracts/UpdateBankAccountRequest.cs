using System.ComponentModel.DataAnnotations;

namespace BankingLoanService.API.Contracts;

public sealed class UpdateBankAccountRequest
{
    [Required, StringLength(150)]
    public string BankName { get; init; } = string.Empty;

    [Required, StringLength(50)]
    public string AccountType { get; init; } = string.Empty;

    [Required, RegularExpression("^[0-9]{4}$")]
    public string LastFour { get; init; } = string.Empty;

    [Range(typeof(decimal), "0", "9999999999999999.99")]
    public decimal Balance { get; init; }

    [Required, StringLength(20)]
    public string IFSC { get; init; } = string.Empty;
}
