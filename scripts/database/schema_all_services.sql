-- ============================================================================
-- FINANCIAL TRACKER DASHBOARD - SQL SERVER MASTER DATABASE DDL SCRIPT
-- ============================================================================

-- 1. USER MANAGEMENT SERVICE DB
CREATE DATABASE FinancialTracker_Db;
GO
USE FinancialTracker_Db;
GO

CREATE TABLE Users (
    UserId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    FirstName NVARCHAR(100) NOT NULL,
    LastName NVARCHAR(100) NOT NULL,
    Email NVARCHAR(255) UNIQUE NOT NULL,
    PhoneNumber NVARCHAR(20) NOT NULL,
    PasswordHash NVARCHAR(500) NULL,
    CreatedAt DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE IdentityProofs (
    ProofId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    DocumentType NVARCHAR(50) NOT NULL, -- Aadhaar, PAN, Passport, SSN
    DocumentNumberEncrypted NVARCHAR(500) NOT NULL,
    DocumentUrl NVARCHAR(1000) NULL,
    IsVerified BIT DEFAULT 0,
    UploadedAt DATETIME2 DEFAULT GETUTCDATE()
);

CREATE TABLE UserBankDetails (
    BankDetailId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    BankName NVARCHAR(150) NOT NULL,
    AccountNumberEncrypted NVARCHAR(500) NOT NULL,
    IFSC_RoutingCode NVARCHAR(20) NOT NULL,
    AccountType NVARCHAR(50) NOT NULL, -- Savings, Salary, Current
    IsPrimary BIT DEFAULT 0
);
GO

-- 2. HOUSEHOLD BILLS SERVICE DB
USE FinancialTracker_Db;
GO

CREATE TABLE HouseholdBills (
    BillId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    Category NVARCHAR(50) NOT NULL, -- Electricity, Gas, PropertyTax, WaterTax, MonthlyProvisions
    ProviderName NVARCHAR(150) NOT NULL,
    ConsumerNumber NVARCHAR(100) NOT NULL DEFAULT N'',
    Amount DECIMAL(18,2) NOT NULL,
    DueDate DATE NOT NULL,
    PaidStatus NVARCHAR(20) DEFAULT 'Pending', -- Pending, Paid, Overdue
    PaidOn DATETIME2 NULL
);
CREATE INDEX IX_HouseholdBills_UserId ON HouseholdBills(UserId);
GO

-- 3. HEALTHCARE SERVICE DB
USE FinancialTracker_Db;
GO

CREATE TABLE HospitalBills (
    HospitalBillId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    HospitalName NVARCHAR(200) NOT NULL,
    DoctorName NVARCHAR(150) NULL,
    PatientDetail NVARCHAR(300) NOT NULL DEFAULT N'Medical expense',
    BillDate DATE NOT NULL,
    TotalAmount DECIMAL(18,2) NOT NULL,
    InsuranceClaimedAmount DECIMAL(18,2) DEFAULT 0,
    OutOfPocketPaid DECIMAL(18,2) NOT NULL,
    PaidStatus NVARCHAR(20) NOT NULL DEFAULT N'Pending'
);
CREATE INDEX IX_HospitalBills_UserId ON HospitalBills(UserId);

CREATE TABLE Medications (
    MedicationId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    HospitalBillId UNIQUEIDENTIFIER FOREIGN KEY REFERENCES HospitalBills(HospitalBillId),
    MedicineName NVARCHAR(200) NOT NULL,
    DosageInfo NVARCHAR(100) NULL,
    Cost DECIMAL(18,2) NOT NULL
);
GO

-- 4. BANKING, CARDS & LOANS SERVICE DB
USE FinancialTracker_Db;
GO

CREATE TABLE CardBills (
    CardBillId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    CardType NVARCHAR(20) NOT NULL, -- Credit, Debit
    IssuerBank NVARCHAR(100) NOT NULL,
    CardLastFourDigits NVARCHAR(4) NOT NULL,
    StatementDate DATE NOT NULL,
    DueDate DATE NOT NULL,
    TotalAmountDue DECIMAL(18,2) NOT NULL,
    MinimumAmountDue DECIMAL(18,2) NOT NULL,
    IsPaid BIT DEFAULT 0
);

CREATE TABLE medical_bills (
    medical_bill_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    provider_name NVARCHAR(100) NOT NULL,
    detail_description NVARCHAR(255) NULL,
    bill_date DATE NOT NULL,
    insurance_covered DECIMAL(18,2) NULL,
    out_of_pocket_due DECIMAL(18,2) NOT NULL,
    status NVARCHAR(20) NOT NULL
);
CREATE INDEX IX_medical_bills_user_id ON medical_bills(user_id, bill_date DESC);

CREATE TABLE credit_card_statements (
    card_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    issuer_name NVARCHAR(100) NOT NULL,
    statement_balance DECIMAL(18,2) NOT NULL,
    minimum_due DECIMAL(18,2) NOT NULL,
    due_date DATE NOT NULL,
    credit_limit DECIMAL(18,2) NOT NULL
);
CREATE INDEX IX_credit_card_statements_user_id ON credit_card_statements(user_id);

CREATE TABLE bank_loans (
    loan_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    loan_type NVARCHAR(50) NOT NULL,
    lender NVARCHAR(150) NOT NULL,
    interest_rate DECIMAL(5,2) NOT NULL,
    monthly_emi DECIMAL(18,2) NOT NULL,
    principal_remaining DECIMAL(18,2) NOT NULL,
    years_remaining DECIMAL(6,2) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
CREATE INDEX IX_bank_loans_user_id ON bank_loans(user_id);

CREATE TABLE third_party_loans (
    tp_loan_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    app_name NVARCHAR(100) NOT NULL,
    loan_type NVARCHAR(20) NOT NULL,
    balance DECIMAL(18,2) NOT NULL,
    monthly_emi DECIMAL(18,2) NOT NULL,
    due_date DATE NOT NULL
);
CREATE INDEX IX_third_party_loans_user_id ON third_party_loans(user_id, due_date);

CREATE TABLE informal_debts (
    debt_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    lender_name NVARCHAR(100) NOT NULL,
    notes NVARCHAR(255) NOT NULL,
    original_amount DECIMAL(18,2) NOT NULL,
    remaining_balance DECIMAL(18,2) NOT NULL,
    target_repayment_date DATE NOT NULL
);
CREATE INDEX IX_informal_debts_user_id ON informal_debts(user_id, target_repayment_date);

CREATE TABLE other_income (
    income_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    source_name NVARCHAR(100) NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    frequency NVARCHAR(50) NOT NULL,
    category NVARCHAR(50) NOT NULL
);
CREATE INDEX IX_other_income_user_id ON other_income(user_id, category);

CREATE TABLE bank_accounts (
    bank_account_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    bank_name NVARCHAR(150) NOT NULL,
    account_type NVARCHAR(50) NOT NULL,
    last_four NVARCHAR(4) NOT NULL,
    balance DECIMAL(18,2) NOT NULL,
    ifsc NVARCHAR(20) NOT NULL,
    created_at DATETIME2 NOT NULL DEFAULT GETUTCDATE()
);
CREATE INDEX IX_bank_accounts_user_id ON bank_accounts(user_id);

CREATE TABLE debit_transactions (
    transaction_id UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    user_id UNIQUEIDENTIFIER NOT NULL,
    account_id UNIQUEIDENTIFIER NOT NULL
        FOREIGN KEY REFERENCES bank_accounts(bank_account_id),
    transaction_date DATE NOT NULL,
    merchant_name NVARCHAR(150) NOT NULL,
    amount DECIMAL(18,2) NOT NULL,
    category NVARCHAR(50) NOT NULL
);
CREATE INDEX IX_debit_transactions_user_id ON debit_transactions(user_id, transaction_date DESC);
GO

-- 5. CREDIT SCORE & OTHER SOURCES DB
USE FinancialTracker_Db;
GO

CREATE TABLE CreditScoreReports (
    ReportId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    BureauName NVARCHAR(50) NOT NULL, -- CIBIL, Experian, Equifax
    CreditScore INT NOT NULL,
    ReportDate DATE NOT NULL,
    SummaryNotes NVARCHAR(MAX) NULL
);
CREATE INDEX IX_CreditScoreReports_UserId ON CreditScoreReports(UserId);

CREATE TABLE OtherFinancialSources (
    SourceId UNIQUEIDENTIFIER PRIMARY KEY DEFAULT NEWID(),
    UserId UNIQUEIDENTIFIER NOT NULL,
    SourceName NVARCHAR(100) NOT NULL, -- Freelance, Investments, Rental, OtherBorrowBill
    Category NVARCHAR(50) NOT NULL, -- Income, BorrowedFund, Miscellaneous
    Amount DECIMAL(18,2) NOT NULL,
    TransactionDate DATE NOT NULL
);
CREATE INDEX IX_OtherFinancialSources_UserId ON OtherFinancialSources(UserId);
GO