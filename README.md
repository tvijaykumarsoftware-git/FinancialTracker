# Financial Tracker Dashboard - Enterprise Microservices Solution

A production-grade Financial Tracker Dashboard built with **ASP.NET Core 8**, **Angular 17+ (Standalone Components)**, and **SQL Server**.

## 🚀 Architecture Overview

This repository is organized as a modular microservices architecture following **Domain-Driven Design (DDD)** and **Clean Architecture** principles.

```
FinancialTrackerDashboard/
├── src/
│   ├── Gateways/
│   │   └── ApiGateway/                # YARP / Ocelot Reverse Proxy Gateway
│   ├── Services/
│   │   ├── UserService/               # User, Contact, Identity Proofs, Bank Details
│   │   ├── HouseholdService/         # EB, Gas, Property Tax, Water Tax, Provisions
│   │   ├── HealthcareService/        # Hospital Bills & Medication Tracking
│   │   ├── BankingLoanService/       # Credit/Debit Cards, Loans (Personal/Home/Vehicle/Bajaj/Other)
│   │   └── CreditScoreService/       # Bureau Reports & Other Financial Sources
│   └── Clients/
│       └── angular-dashboard/         # Angular 17 SPA Application
├── scripts/
│   └── database/                     # SQL Server DDL & Migration Scripts
└── .gitignore
```

## 🛠️ Technology Stack
- **Backend**: ASP.NET Core 8 Web API, Entity Framework Core 8, C# 12
- **Frontend**: Angular 17+, RxJS, TypeScript, Tailwind CSS / Material UI
- **Database**: SQL Server 2022 (Individual Database-per-Service pattern)
- **API Gateway**: YARP / Ocelot

## ⚡ How to Run Locally

### 1. Database Setup
UserService uses the SQL Server LocalDB connection in `src/Services/UserService/UserService.API/appsettings.json` by default and stores users in the shared `FinancialTracker_Db` database. It creates the Users table and email index if needed; set `ConnectionStrings__UserDatabase` to override the connection. HouseholdService uses `ConnectionStrings:HouseholdDatabase` in `src/Services/HouseholdService/HouseholdService.API/appsettings.json`, creates the `FinancialTracker_Db` database and `HouseholdBills` table on first run, and accepts `ConnectionStrings__HouseholdDatabase` as an environment override. HealthcareService uses `ConnectionStrings:HealthcareDatabase` in `src/Services/HealthcareService/HealthcareService.API/appsettings.json` and stores hospital bills in the same `FinancialTracker_Db` database, creating/upgrading its tables on startup; configure `ConnectionStrings__HealthcareDatabase` to override the default. CreditScoreService uses `ConnectionStrings:CreditScoreDatabase` in `src/Services/CreditScoreService/CreditScoreService.API/appsettings.json` and stores reports and other financial sources in `FinancialTracker_Db`, creating its tables on startup; configure `ConnectionStrings__CreditScoreDatabase` to override the default. BankingLoanService uses `ConnectionStrings:BankingDatabase` in `src/Services/BankingLoanService/BankingLoanService.API/appsettings.json` and persists accounts, bank loans, credit card statements, debit transactions, fintech/PayLater loans, informal debts, other income, and medical expenses in `FinancialTracker_Db.dbo.bank_accounts`, `FinancialTracker_Db.dbo.bank_loans`, `FinancialTracker_Db.dbo.credit_card_statements`, `FinancialTracker_Db.dbo.debit_transactions`, `FinancialTracker_Db.dbo.third_party_loans`, `FinancialTracker_Db.dbo.informal_debts`, `FinancialTracker_Db.dbo.other_income`, and `FinancialTracker_Db.dbo.medical_bills`; configure `ConnectionStrings__BankingDatabase` to override the default. On startup, incompatible legacy tables are preserved in `_legacy` tables before creating GUID-based schemas used by signed-in users. The dashboard's medical expense page uses BankingLoanService and `dbo.medical_bills`; existing `dbo.HospitalBills` records are copied into that table on startup, preserving their IDs. Debit transactions are associated with a bank account belonging to the signed-in user. Informal debts and other income sources are loaded and saved per signed-in user, and paybacks update the stored remaining debt balance. Keep production credentials outside source control. The master schema in `scripts/database/schema_all_services.sql` creates the shared `FinancialTracker_Db` tables for the services.

UserService signs access tokens using a key that is intentionally not stored in `appsettings.json`. Create a local development key with .NET user-secrets:
```powershell
$random = [System.Security.Cryptography.RandomNumberGenerator]::Create()
$bytes = New-Object byte[] 48
$random.GetBytes($bytes)
$key = [Convert]::ToBase64String($bytes)
dotnet user-secrets set "Jwt:SigningKey" $key --project src/Services/UserService/UserService.API
[Array]::Clear($bytes, 0, $bytes.Length)
$random.Dispose()
Remove-Variable key
```
For deployment, supply `Jwt__SigningKey` through your secret manager/environment instead. Use a unique random key of at least 32 bytes.

### 2. Run Backend Microservices
The dashboard's `npm start` command starts the API gateway, UserService, HouseholdService, HealthcareService, BankingLoanService, and CreditScoreService automatically. To run the backend services separately instead, run them in separate terminals:
```bash
# In separate terminal windows (omit the gateway, HouseholdService, HealthcareService, and CreditScoreService if using npm start):
dotnet run --project src/Gateways/ApiGateway
dotnet run --project src/Services/UserService/UserService.API
dotnet run --project src/Services/HouseholdService/HouseholdService.API
dotnet run --project src/Services/HealthcareService/HealthcareService.API
dotnet run --project src/Services/BankingLoanService/BankingLoanService.API
dotnet run --project src/Services/CreditScoreService/CreditScoreService.API
```

### 3. Run Angular Frontend
```bash
cd src/Clients/angular-dashboard
npm ci
npm start
```
Navigate to `http://localhost:4200` in your web browser. Create an account with a password of at least 12 characters containing uppercase and lowercase letters and a number, then sign in. Passwords are hashed by ASP.NET Core Identity's password hasher. Login tokens are kept in memory and cleared when you sign out or reload the page.
`npm start` starts the API gateway (`http://localhost:5000`), UserService (`http://localhost:5001`), HouseholdService (`http://localhost:5002`), HealthcareService (`http://localhost:5003`), BankingLoanService (`http://localhost:5004`), and CreditScoreService (`http://localhost:5005`) when their ports are free. If a service is already listening on its configured port, it reuses that service instead of trying to start a duplicate. Angular starts after all six ports are available, and services started by this command are stopped when Angular exits. The Angular development server proxies `/gateway` requests to the API gateway.
To start only the frontend when the backend services are already running, use `npm run start:frontend`.