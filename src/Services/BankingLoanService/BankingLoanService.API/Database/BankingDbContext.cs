using BankingLoanService.API.Models;
using Microsoft.EntityFrameworkCore;

namespace BankingLoanService.API.Database;

public sealed class BankingDbContext(DbContextOptions<BankingDbContext> options) : DbContext(options)
{
    public DbSet<BankAccount> BankAccounts => Set<BankAccount>();
    public DbSet<BankLoan> BankLoans => Set<BankLoan>();
    public DbSet<CreditCardStatement> CreditCardStatements => Set<CreditCardStatement>();
    public DbSet<DebitTransaction> DebitTransactions => Set<DebitTransaction>();
    public DbSet<ThirdPartyLoan> ThirdPartyLoans => Set<ThirdPartyLoan>();
    public DbSet<InformalDebt> InformalDebts => Set<InformalDebt>();
    public DbSet<OtherIncome> OtherIncome => Set<OtherIncome>();
    public DbSet<MedicalBill> MedicalBills => Set<MedicalBill>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var bankAccounts = modelBuilder.Entity<BankAccount>();
        bankAccounts.ToTable("bank_accounts", "dbo");
        bankAccounts.HasKey(account => account.BankAccountId);
        bankAccounts.Property(account => account.BankAccountId)
            .HasColumnName("bank_account_id")
            .HasDefaultValueSql("NEWID()");
        bankAccounts.Property(account => account.UserId).HasColumnName("user_id").IsRequired();
        bankAccounts.HasIndex(account => account.UserId).HasDatabaseName("IX_bank_accounts_user_id");
        bankAccounts.Property(account => account.BankName).HasColumnName("bank_name").HasMaxLength(150).IsRequired();
        bankAccounts.Property(account => account.AccountType).HasColumnName("account_type").HasMaxLength(50).IsRequired();
        bankAccounts.Property(account => account.LastFour).HasColumnName("last_four").HasMaxLength(4).IsRequired();
        bankAccounts.Property(account => account.Balance).HasColumnName("balance").HasPrecision(18, 2);
        bankAccounts.Property(account => account.IFSC).HasColumnName("ifsc").HasMaxLength(20).IsRequired();
        bankAccounts.Property(account => account.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETUTCDATE()");

        var bankLoans = modelBuilder.Entity<BankLoan>();
        bankLoans.ToTable("bank_loans", "dbo");
        bankLoans.HasKey(loan => loan.LoanId);
        bankLoans.Property(loan => loan.LoanId)
            .HasColumnName("loan_id")
            .HasDefaultValueSql("NEWID()");
        bankLoans.Property(loan => loan.UserId).HasColumnName("user_id").IsRequired();
        bankLoans.HasIndex(loan => loan.UserId).HasDatabaseName("IX_bank_loans_user_id");
        bankLoans.Property(loan => loan.LoanType).HasColumnName("loan_type").HasMaxLength(50).IsRequired();
        bankLoans.Property(loan => loan.Lender).HasColumnName("lender").HasMaxLength(150).IsRequired();
        bankLoans.Property(loan => loan.InterestRate).HasColumnName("interest_rate").HasPrecision(5, 2);
        bankLoans.Property(loan => loan.MonthlyEmi).HasColumnName("monthly_emi").HasPrecision(18, 2);
        bankLoans.Property(loan => loan.PrincipalRemaining).HasColumnName("principal_remaining").HasPrecision(18, 2);
        bankLoans.Property(loan => loan.YearsRemaining).HasColumnName("years_remaining").HasPrecision(6, 2);
        bankLoans.Property(loan => loan.CreatedAt).HasColumnName("created_at").HasDefaultValueSql("GETUTCDATE()");

        var creditCardStatements = modelBuilder.Entity<CreditCardStatement>();
        creditCardStatements.ToTable("credit_card_statements", "dbo");
        creditCardStatements.HasKey(statement => statement.CardId);
        creditCardStatements.Property(statement => statement.CardId)
            .HasColumnName("card_id")
            .HasDefaultValueSql("NEWID()");
        creditCardStatements.Property(statement => statement.UserId).HasColumnName("user_id").IsRequired();
        creditCardStatements.HasIndex(statement => statement.UserId)
            .HasDatabaseName("IX_credit_card_statements_user_id");
        creditCardStatements.Property(statement => statement.IssuerName)
            .HasColumnName("issuer_name")
            .HasMaxLength(100)
            .IsRequired();
        creditCardStatements.Property(statement => statement.StatementBalance)
            .HasColumnName("statement_balance")
            .HasPrecision(18, 2);
        creditCardStatements.Property(statement => statement.MinimumDue)
            .HasColumnName("minimum_due")
            .HasPrecision(18, 2);
        creditCardStatements.Property(statement => statement.DueDate).HasColumnName("due_date");
        creditCardStatements.Property(statement => statement.CreditLimit)
            .HasColumnName("credit_limit")
            .HasPrecision(18, 2);

        var debitTransactions = modelBuilder.Entity<DebitTransaction>();
        debitTransactions.ToTable("debit_transactions", "dbo");
        debitTransactions.HasKey(transaction => transaction.TransactionId);
        debitTransactions.Property(transaction => transaction.TransactionId)
            .HasColumnName("transaction_id")
            .HasDefaultValueSql("NEWID()");
        debitTransactions.Property(transaction => transaction.UserId).HasColumnName("user_id").IsRequired();
        debitTransactions.Property(transaction => transaction.AccountId).HasColumnName("account_id").IsRequired();
        debitTransactions.HasOne(transaction => transaction.BankAccount)
            .WithMany()
            .HasForeignKey(transaction => transaction.AccountId)
            .OnDelete(DeleteBehavior.Restrict);
        debitTransactions.HasIndex(transaction => transaction.UserId)
            .HasDatabaseName("IX_debit_transactions_user_id");
        debitTransactions.Property(transaction => transaction.TransactionDate)
            .HasColumnName("transaction_date")
            .IsRequired();
        debitTransactions.Property(transaction => transaction.MerchantName)
            .HasColumnName("merchant_name")
            .HasMaxLength(150)
            .IsRequired();
        debitTransactions.Property(transaction => transaction.Amount)
            .HasColumnName("amount")
            .HasPrecision(18, 2);
        debitTransactions.Property(transaction => transaction.Category)
            .HasColumnName("category")
            .HasMaxLength(50)
            .IsRequired();

        var thirdPartyLoans = modelBuilder.Entity<ThirdPartyLoan>();
        thirdPartyLoans.ToTable("third_party_loans", "dbo");
        thirdPartyLoans.HasKey(loan => loan.LoanId);
        thirdPartyLoans.Property(loan => loan.LoanId)
            .HasColumnName("tp_loan_id")
            .HasDefaultValueSql("NEWID()");
        thirdPartyLoans.Property(loan => loan.UserId).HasColumnName("user_id").IsRequired();
        thirdPartyLoans.HasIndex(loan => loan.UserId)
            .HasDatabaseName("IX_third_party_loans_user_id");
        thirdPartyLoans.Property(loan => loan.AppName)
            .HasColumnName("app_name")
            .HasMaxLength(100)
            .IsRequired();
        thirdPartyLoans.Property(loan => loan.LoanType)
            .HasColumnName("loan_type")
            .HasMaxLength(20)
            .IsRequired();
        thirdPartyLoans.Property(loan => loan.Balance)
            .HasColumnName("balance")
            .HasPrecision(18, 2);
        thirdPartyLoans.Property(loan => loan.MonthlyEmi)
            .HasColumnName("monthly_emi")
            .HasPrecision(18, 2);
        thirdPartyLoans.Property(loan => loan.DueDate).HasColumnName("due_date");

        var informalDebts = modelBuilder.Entity<InformalDebt>();
        informalDebts.ToTable("informal_debts", "dbo");
        informalDebts.HasKey(debt => debt.DebtId);
        informalDebts.Property(debt => debt.DebtId)
            .HasColumnName("debt_id")
            .HasDefaultValueSql("NEWID()");
        informalDebts.Property(debt => debt.UserId).HasColumnName("user_id").IsRequired();
        informalDebts.HasIndex(debt => debt.UserId)
            .HasDatabaseName("IX_informal_debts_user_id");
        informalDebts.Property(debt => debt.LenderName)
            .HasColumnName("lender_name")
            .HasMaxLength(100)
            .IsRequired();
        informalDebts.Property(debt => debt.Notes)
            .HasColumnName("notes")
            .HasMaxLength(255)
            .IsRequired();
        informalDebts.Property(debt => debt.OriginalAmount)
            .HasColumnName("original_amount")
            .HasPrecision(18, 2);
        informalDebts.Property(debt => debt.RemainingBalance)
            .HasColumnName("remaining_balance")
            .HasPrecision(18, 2);
        informalDebts.Property(debt => debt.TargetRepaymentDate)
            .HasColumnName("target_repayment_date");

        var otherIncome = modelBuilder.Entity<OtherIncome>();
        otherIncome.ToTable("other_income", "dbo");
        otherIncome.HasKey(source => source.IncomeId);
        otherIncome.Property(source => source.IncomeId)
            .HasColumnName("income_id")
            .HasDefaultValueSql("NEWID()");
        otherIncome.Property(source => source.UserId).HasColumnName("user_id").IsRequired();
        otherIncome.HasIndex(source => source.UserId)
            .HasDatabaseName("IX_other_income_user_id");
        otherIncome.Property(source => source.SourceName)
            .HasColumnName("source_name")
            .HasMaxLength(100)
            .IsRequired();
        otherIncome.Property(source => source.Amount)
            .HasColumnName("amount")
            .HasPrecision(18, 2);
        otherIncome.Property(source => source.Frequency)
            .HasColumnName("frequency")
            .HasMaxLength(50)
            .IsRequired();
        otherIncome.Property(source => source.Category)
            .HasColumnName("category")
            .HasMaxLength(50)
            .IsRequired();

        var medicalBills = modelBuilder.Entity<MedicalBill>();
        medicalBills.ToTable("medical_bills", "dbo");
        medicalBills.HasKey(bill => bill.MedicalBillId);
        medicalBills.Property(bill => bill.MedicalBillId)
            .HasColumnName("medical_bill_id")
            .HasDefaultValueSql("NEWID()");
        medicalBills.Property(bill => bill.UserId).HasColumnName("user_id").IsRequired();
        medicalBills.HasIndex(bill => bill.UserId)
            .HasDatabaseName("IX_medical_bills_user_id");
        medicalBills.Property(bill => bill.ProviderName)
            .HasColumnName("provider_name")
            .HasMaxLength(100)
            .IsRequired();
        medicalBills.Property(bill => bill.DetailDescription)
            .HasColumnName("detail_description")
            .HasMaxLength(255);
        medicalBills.Property(bill => bill.BillDate)
            .HasColumnName("bill_date")
            .HasColumnType("date");
        medicalBills.Property(bill => bill.InsuranceCovered)
            .HasColumnName("insurance_covered")
            .HasPrecision(18, 2);
        medicalBills.Property(bill => bill.OutOfPocketDue)
            .HasColumnName("out_of_pocket_due")
            .HasPrecision(18, 2);
        medicalBills.Property(bill => bill.Status)
            .HasColumnName("status")
            .HasMaxLength(20)
            .IsRequired();
    }
}
