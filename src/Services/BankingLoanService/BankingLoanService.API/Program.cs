using BankingLoanService.API.Database;
using BankingLoanService.API.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

var connectionString = builder.Configuration.GetConnectionString("BankingDatabase")
    ?? throw new InvalidOperationException("ConnectionStrings:BankingDatabase must be configured.");

builder.Services.AddControllers();
builder.Services.AddDbContext<BankingDbContext>(options => options.UseSqlServer(connectionString));
builder.Services.AddScoped<IInformalDebtService, InformalDebtService>();
builder.Services.AddScoped<IOtherIncomeService, OtherIncomeService>();
builder.Services.AddScoped<IMedicalBillService, MedicalBillService>();

var app = builder.Build();

app.MapControllers();

await using (var scope = app.Services.CreateAsyncScope())
{
    var dbContext = scope.ServiceProvider.GetRequiredService<BankingDbContext>();
    await dbContext.Database.EnsureCreatedAsync();
    await dbContext.Database.ExecuteSqlRawAsync(
        """
        IF OBJECT_ID(N'dbo.bank_accounts', N'U') IS NOT NULL
            AND COL_LENGTH(N'dbo.bank_accounts', N'bank_account_id') IS NULL
        BEGIN
            IF OBJECT_ID(N'dbo.bank_accounts_legacy', N'U') IS NOT NULL
                THROW 51000, 'Both legacy and current bank_accounts tables exist. Resolve the legacy table before starting BankingLoanService.', 1;

            EXEC sys.sp_rename N'dbo.bank_accounts', N'bank_accounts_legacy';
        END;

        IF OBJECT_ID(N'dbo.bank_accounts', N'U') IS NULL
        BEGIN
            CREATE TABLE dbo.bank_accounts (
                bank_account_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_bank_accounts PRIMARY KEY DEFAULT NEWID(),
                user_id UNIQUEIDENTIFIER NOT NULL,
                bank_name NVARCHAR(150) NOT NULL,
                account_type NVARCHAR(50) NOT NULL,
                last_four NVARCHAR(4) NOT NULL,
                balance DECIMAL(18,2) NOT NULL,
                ifsc NVARCHAR(20) NOT NULL,
                created_at DATETIME2 NOT NULL CONSTRAINT DF_bank_accounts_created_at DEFAULT GETUTCDATE()
            );
        END;

        IF OBJECT_ID(N'dbo.BankAccounts', N'U') IS NOT NULL
            AND COL_LENGTH(N'dbo.BankAccounts', N'BankAccountId') IS NOT NULL
        BEGIN
            EXEC sys.sp_executesql N'
                INSERT INTO dbo.bank_accounts
                    (bank_account_id, user_id, bank_name, account_type, last_four, balance, ifsc, created_at)
                SELECT
                    source.BankAccountId,
                    source.UserId,
                    source.BankName,
                    source.AccountType,
                    source.LastFour,
                    source.Balance,
                    source.IFSC,
                    source.CreatedAt
                FROM dbo.BankAccounts AS source
                WHERE NOT EXISTS (
                    SELECT 1
                    FROM dbo.bank_accounts AS target
                    WHERE target.bank_account_id = source.BankAccountId);';
        END;

        IF NOT EXISTS (
            SELECT 1 FROM sys.indexes
            WHERE name = N'IX_bank_accounts_user_id'
              AND object_id = OBJECT_ID(N'dbo.bank_accounts'))
            CREATE INDEX IX_bank_accounts_user_id ON dbo.bank_accounts(user_id);

        IF OBJECT_ID(N'dbo.bank_loans', N'U') IS NOT NULL
            AND NOT EXISTS (
                SELECT 1
                FROM sys.columns
                WHERE object_id = OBJECT_ID(N'dbo.bank_loans')
                  AND name = N'loan_id'
                  AND system_type_id = 36)
        BEGIN
            IF OBJECT_ID(N'dbo.bank_loans_legacy', N'U') IS NOT NULL
                THROW 51001, 'Both legacy and current bank_loans tables exist. Resolve the legacy table before starting BankingLoanService.', 1;

            EXEC sys.sp_rename N'dbo.bank_loans', N'bank_loans_legacy';
        END;

        IF OBJECT_ID(N'dbo.bank_loans', N'U') IS NULL
        BEGIN
            CREATE TABLE dbo.bank_loans (
                loan_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_bank_loans_current PRIMARY KEY DEFAULT NEWID(),
                user_id UNIQUEIDENTIFIER NOT NULL,
                loan_type NVARCHAR(50) NOT NULL,
                lender NVARCHAR(150) NOT NULL,
                interest_rate DECIMAL(5,2) NOT NULL,
                monthly_emi DECIMAL(18,2) NOT NULL,
                principal_remaining DECIMAL(18,2) NOT NULL,
                years_remaining DECIMAL(6,2) NOT NULL,
                created_at DATETIME2 NOT NULL CONSTRAINT DF_bank_loans_created_at_current DEFAULT GETUTCDATE()
            );
        END;

        IF NOT EXISTS (
            SELECT 1 FROM sys.indexes
            WHERE name = N'IX_bank_loans_user_id'
              AND object_id = OBJECT_ID(N'dbo.bank_loans'))
            CREATE INDEX IX_bank_loans_user_id ON dbo.bank_loans(user_id);

        IF OBJECT_ID(N'dbo.credit_card_statements', N'U') IS NOT NULL
            AND (
                NOT EXISTS (
                    SELECT 1
                    FROM sys.columns
                    WHERE object_id = OBJECT_ID(N'dbo.credit_card_statements')
                      AND name = N'card_id'
                      AND system_type_id = 36)
                OR NOT EXISTS (
                    SELECT 1
                    FROM sys.columns
                    WHERE object_id = OBJECT_ID(N'dbo.credit_card_statements')
                      AND name = N'user_id'
                      AND system_type_id = 36))
        BEGIN
            IF OBJECT_ID(N'dbo.credit_card_statements_legacy', N'U') IS NOT NULL
                THROW 51002, 'Both legacy and current credit_card_statements tables exist. Resolve the legacy table before starting BankingLoanService.', 1;

            EXEC sys.sp_rename N'dbo.credit_card_statements', N'credit_card_statements_legacy';
        END;

        IF OBJECT_ID(N'dbo.credit_card_statements', N'U') IS NULL
        BEGIN
            CREATE TABLE dbo.credit_card_statements (
                card_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_credit_card_statements_current PRIMARY KEY DEFAULT NEWID(),
                user_id UNIQUEIDENTIFIER NOT NULL,
                issuer_name NVARCHAR(100) NOT NULL,
                statement_balance DECIMAL(18,2) NOT NULL,
                minimum_due DECIMAL(18,2) NOT NULL,
                due_date DATE NOT NULL,
                credit_limit DECIMAL(18,2) NOT NULL
            );
        END;

        IF NOT EXISTS (
            SELECT 1 FROM sys.indexes
            WHERE name = N'IX_credit_card_statements_user_id'
              AND object_id = OBJECT_ID(N'dbo.credit_card_statements'))
            CREATE INDEX IX_credit_card_statements_user_id
                ON dbo.credit_card_statements(user_id);

        IF OBJECT_ID(N'dbo.debit_transactions', N'U') IS NOT NULL
            AND (
                NOT EXISTS (
                    SELECT 1
                    FROM sys.columns
                    WHERE object_id = OBJECT_ID(N'dbo.debit_transactions')
                      AND name = N'transaction_id'
                      AND system_type_id = 36)
                OR NOT EXISTS (
                    SELECT 1
                    FROM sys.columns
                    WHERE object_id = OBJECT_ID(N'dbo.debit_transactions')
                      AND name = N'user_id'
                      AND system_type_id = 36)
                OR NOT EXISTS (
                    SELECT 1
                    FROM sys.columns
                    WHERE object_id = OBJECT_ID(N'dbo.debit_transactions')
                      AND name = N'account_id'
                      AND system_type_id = 36))
        BEGIN
            IF OBJECT_ID(N'dbo.debit_transactions_legacy', N'U') IS NOT NULL
                THROW 51003, 'Both legacy and current debit_transactions tables exist. Resolve the legacy table before starting BankingLoanService.', 1;

            EXEC sys.sp_rename N'dbo.debit_transactions', N'debit_transactions_legacy';
        END;

        IF OBJECT_ID(N'dbo.debit_transactions', N'U') IS NULL
        BEGIN
            CREATE TABLE dbo.debit_transactions (
                transaction_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_debit_transactions_current PRIMARY KEY DEFAULT NEWID(),
                user_id UNIQUEIDENTIFIER NOT NULL,
                account_id UNIQUEIDENTIFIER NOT NULL,
                transaction_date DATE NOT NULL,
                merchant_name NVARCHAR(150) NOT NULL,
                amount DECIMAL(18,2) NOT NULL,
                category NVARCHAR(50) NOT NULL,
                CONSTRAINT FK_debit_transactions_bank_accounts
                    FOREIGN KEY (account_id) REFERENCES dbo.bank_accounts(bank_account_id)
                    ON DELETE NO ACTION
            );
        END;

        IF NOT EXISTS (
            SELECT 1 FROM sys.indexes
            WHERE name = N'IX_debit_transactions_user_id'
              AND object_id = OBJECT_ID(N'dbo.debit_transactions'))
            CREATE INDEX IX_debit_transactions_user_id
                ON dbo.debit_transactions(user_id, transaction_date DESC);

        IF OBJECT_ID(N'dbo.third_party_loans', N'U') IS NOT NULL
            AND (
                NOT EXISTS (
                    SELECT 1
                    FROM sys.columns
                    WHERE object_id = OBJECT_ID(N'dbo.third_party_loans')
                      AND name = N'tp_loan_id'
                      AND system_type_id = 36)
                OR NOT EXISTS (
                    SELECT 1
                    FROM sys.columns
                    WHERE object_id = OBJECT_ID(N'dbo.third_party_loans')
                      AND name = N'user_id'
                      AND system_type_id = 36)
                OR NOT EXISTS (
                    SELECT 1
                    FROM sys.columns
                    WHERE object_id = OBJECT_ID(N'dbo.third_party_loans')
                      AND name = N'loan_type'))
        BEGIN
            IF OBJECT_ID(N'dbo.third_party_loans_legacy', N'U') IS NOT NULL
                THROW 51004, 'Both legacy and current third_party_loans tables exist. Resolve the legacy table before starting BankingLoanService.', 1;

            EXEC sys.sp_rename N'dbo.third_party_loans', N'third_party_loans_legacy';
        END;

        IF OBJECT_ID(N'dbo.third_party_loans', N'U') IS NULL
        BEGIN
            CREATE TABLE dbo.third_party_loans (
                tp_loan_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_third_party_loans_current PRIMARY KEY DEFAULT NEWID(),
                user_id UNIQUEIDENTIFIER NOT NULL,
                app_name NVARCHAR(100) NOT NULL,
                loan_type NVARCHAR(20) NOT NULL,
                balance DECIMAL(18,2) NOT NULL,
                monthly_emi DECIMAL(18,2) NOT NULL,
                due_date DATE NOT NULL
            );
        END;

        IF NOT EXISTS (
            SELECT 1 FROM sys.indexes
            WHERE name = N'IX_third_party_loans_user_id'
              AND object_id = OBJECT_ID(N'dbo.third_party_loans'))
            CREATE INDEX IX_third_party_loans_user_id
                ON dbo.third_party_loans(user_id, due_date);

        IF OBJECT_ID(N'dbo.informal_debts', N'U') IS NOT NULL
            AND (
                NOT EXISTS (
                    SELECT 1
                    FROM sys.columns
                    WHERE object_id = OBJECT_ID(N'dbo.informal_debts')
                      AND name = N'debt_id'
                      AND system_type_id = 36)
                OR NOT EXISTS (
                    SELECT 1
                    FROM sys.columns
                    WHERE object_id = OBJECT_ID(N'dbo.informal_debts')
                      AND name = N'user_id'
                      AND system_type_id = 36))
        BEGIN
            IF OBJECT_ID(N'dbo.informal_debts_legacy', N'U') IS NOT NULL
                THROW 51005, 'Both legacy and current informal_debts tables exist. Resolve the legacy table before starting BankingLoanService.', 1;

            EXEC sys.sp_rename N'dbo.informal_debts', N'informal_debts_legacy';
        END;

        IF OBJECT_ID(N'dbo.informal_debts', N'U') IS NULL
        BEGIN
            CREATE TABLE dbo.informal_debts (
                debt_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_informal_debts_current PRIMARY KEY DEFAULT NEWID(),
                user_id UNIQUEIDENTIFIER NOT NULL,
                lender_name NVARCHAR(100) NOT NULL,
                notes NVARCHAR(255) NOT NULL,
                original_amount DECIMAL(18,2) NOT NULL,
                remaining_balance DECIMAL(18,2) NOT NULL,
                target_repayment_date DATE NOT NULL
            );
        END;

        IF NOT EXISTS (
            SELECT 1 FROM sys.indexes
            WHERE name = N'IX_informal_debts_user_id'
              AND object_id = OBJECT_ID(N'dbo.informal_debts'))
            CREATE INDEX IX_informal_debts_user_id
                ON dbo.informal_debts(user_id, target_repayment_date);

        IF OBJECT_ID(N'dbo.other_income', N'U') IS NOT NULL
            AND (
                NOT EXISTS (
                    SELECT 1
                    FROM sys.columns
                    WHERE object_id = OBJECT_ID(N'dbo.other_income')
                      AND name = N'income_id'
                      AND system_type_id = 36)
                OR NOT EXISTS (
                    SELECT 1
                    FROM sys.columns
                    WHERE object_id = OBJECT_ID(N'dbo.other_income')
                      AND name = N'user_id'
                      AND system_type_id = 36))
        BEGIN
            IF OBJECT_ID(N'dbo.other_income_legacy', N'U') IS NOT NULL
                THROW 51006, 'Both legacy and current other_income tables exist. Resolve the legacy table before starting BankingLoanService.', 1;

            EXEC sys.sp_rename N'dbo.other_income', N'other_income_legacy';
        END;

        IF OBJECT_ID(N'dbo.other_income', N'U') IS NULL
        BEGIN
            CREATE TABLE dbo.other_income (
                income_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_other_income_current PRIMARY KEY DEFAULT NEWID(),
                user_id UNIQUEIDENTIFIER NOT NULL,
                source_name NVARCHAR(100) NOT NULL,
                amount DECIMAL(18,2) NOT NULL,
                frequency NVARCHAR(50) NOT NULL,
                category NVARCHAR(50) NOT NULL
            );
        END;

        IF NOT EXISTS (
            SELECT 1 FROM sys.indexes
            WHERE name = N'IX_other_income_user_id'
              AND object_id = OBJECT_ID(N'dbo.other_income'))
            CREATE INDEX IX_other_income_user_id
                ON dbo.other_income(user_id, category);

        IF OBJECT_ID(N'dbo.medical_bills', N'U') IS NOT NULL
            AND (
                NOT EXISTS (
                    SELECT 1
                    FROM sys.columns
                    WHERE object_id = OBJECT_ID(N'dbo.medical_bills')
                      AND name = N'medical_bill_id'
                      AND system_type_id = 36)
                OR NOT EXISTS (
                    SELECT 1
                    FROM sys.columns
                    WHERE object_id = OBJECT_ID(N'dbo.medical_bills')
                      AND name = N'user_id'
                      AND system_type_id = 36))
        BEGIN
            IF OBJECT_ID(N'dbo.medical_bills_legacy', N'U') IS NOT NULL
                THROW 51007, 'Both legacy and current medical_bills tables exist. Resolve the legacy table before starting BankingLoanService.', 1;

            EXEC sys.sp_rename N'dbo.medical_bills', N'medical_bills_legacy';
        END;

        IF OBJECT_ID(N'dbo.medical_bills', N'U') IS NULL
        BEGIN
            CREATE TABLE dbo.medical_bills (
                medical_bill_id UNIQUEIDENTIFIER NOT NULL CONSTRAINT PK_medical_bills_current PRIMARY KEY DEFAULT NEWID(),
                user_id UNIQUEIDENTIFIER NOT NULL,
                provider_name NVARCHAR(100) NOT NULL,
                detail_description NVARCHAR(255) NULL,
                bill_date DATE NOT NULL,
                insurance_covered DECIMAL(18,2) NULL,
                out_of_pocket_due DECIMAL(18,2) NOT NULL,
                status NVARCHAR(20) NOT NULL
            );
        END;

        IF NOT EXISTS (
            SELECT 1 FROM sys.indexes
            WHERE name = N'IX_medical_bills_user_id'
              AND object_id = OBJECT_ID(N'dbo.medical_bills'))
            CREATE INDEX IX_medical_bills_user_id
                ON dbo.medical_bills(user_id, bill_date DESC);

        IF OBJECT_ID(N'dbo.BankingServiceMigrations', N'U') IS NULL
            CREATE TABLE dbo.BankingServiceMigrations (
                MigrationId NVARCHAR(150) NOT NULL CONSTRAINT PK_BankingServiceMigrations PRIMARY KEY,
                AppliedAt DATETIME2 NOT NULL CONSTRAINT DF_BankingServiceMigrations_AppliedAt DEFAULT GETUTCDATE()
            );

        IF NOT EXISTS (
            SELECT 1
            FROM dbo.BankingServiceMigrations
            WHERE MigrationId = N'20261028_CopyHospitalBillsToMedicalBills')
        BEGIN
            IF OBJECT_ID(N'dbo.HospitalBills', N'U') IS NOT NULL
            BEGIN
                EXEC sys.sp_executesql N'
                    INSERT INTO dbo.medical_bills
                        (medical_bill_id, user_id, provider_name, detail_description, bill_date,
                         insurance_covered, out_of_pocket_due, status)
                    SELECT
                        source.HospitalBillId,
                        source.UserId,
                        source.HospitalName,
                        source.PatientDetail,
                        source.BillDate,
                        source.InsuranceClaimedAmount,
                        source.OutOfPocketPaid,
                        source.PaidStatus
                    FROM dbo.HospitalBills AS source
                    WHERE NOT EXISTS (
                        SELECT 1
                        FROM dbo.medical_bills AS target
                        WHERE target.medical_bill_id = source.HospitalBillId);';
            END;

            INSERT INTO dbo.BankingServiceMigrations (MigrationId)
            VALUES (N'20261028_CopyHospitalBillsToMedicalBills');
        END;
        """);
}

app.Run();
