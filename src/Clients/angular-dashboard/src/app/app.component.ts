import { ChangeDetectorRef, Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpErrorResponse } from '@angular/common/http';
import { DashboardService } from './services/dashboard.service';
import { AuthService } from './services/auth.service';
import { AuthResponse } from './models/auth.model';
import { BankAccount, BankLoan as BankLoanRecord, CreateBankAccountRequest, CreateBankLoanRequest, CreateCreditCardStatementRequest, CreateDebitTransactionRequest, CreateHouseholdBillRequest, CreateInformalDebtRequest, CreateMedicalExpenseRequest, CreateOtherIncomeRequest, CreateThirdPartyLoanRequest, CreditCardStatement, CreditScoreReport, DebitTransaction as DebitTransactionRecord, HouseholdBill, InformalDebt, MedicalExpenseSummary, OtherIncomeSource, RecordInformalDebtPaybackRequest, ThirdPartyLoan, UpdateHouseholdBillRequest, UpdateMedicalExpenseRequest } from './models/finance.model';

interface DueItem {
  name: string;
  dueDate: string;
  amount: number;
  status: string;
  category?: string;
}

interface EntryForm {
  name: string;
  amount: number;
  category: string;
  dueDate: string;
}

interface BankAccountForm {
  bankName: string;
  accountType: string;
  lastFour: string;
  balance: number;
  ifsc: string;
}

interface CreditCard {
  id: string;
  name: string;
  statementBalance: number;
  minimumDue: number;
  dueDate: string;
  creditLimit: number;
}

interface CreditCardForm {
  name: string;
  statementBalance: number;
  minimumDue: number;
  dueDate: string;
  creditLimit: number;
}

interface DebitTransaction {
  id: string;
  date: string;
  bankAccount: string;
  accountId: string;
  merchant: string;
  amount: number;
  category: string;
}

interface DebitTransactionForm {
  date: string;
  accountId: string;
  merchant: string;
  amount: number;
  category: string;
}

interface BankLoan {
  id: string;
  lender: string;
  type: 'Home Loan' | 'Personal Loan' | 'Vehicle Loan' | 'Other';
  interestRate: number;
  monthlyEmi: number;
  principalRemaining: number;
  yearsRemaining: number;
}

interface BankLoanForm {
  lender: string;
  type: BankLoan['type'];
  interestRate: number;
  monthlyEmi: number;
  principalRemaining: number;
  yearsRemaining: number;
}

interface AppLoan {
  id: string;
  appName: string;
  type: 'App Loan' | 'PayLater';
  outstandingBalance: number;
  nextEmi: number;
  dueDate: string;
}

interface AppLoanForm {
  appName: string;
  type: AppLoan['type'];
  outstandingBalance: number;
  nextEmi: number;
  dueDate: string;
}

interface InformalBorrowing {
  id: string;
  lender: string;
  notes: string;
  initialAmount: number;
  remainingBalance: number;
  targetRepaymentDate: string;
}

interface InformalBorrowingForm {
  lender: string;
  notes: string;
  initialAmount: number;
  targetRepaymentDate: string;
}

interface IncomeSource {
  id: string;
  name: string;
  category: string;
  frequency: string;
  amount: number;
}

interface IncomeSourceForm {
  name: string;
  category: IncomeSource['category'];
  frequency: IncomeSource['frequency'];
  amount: number;
}

interface AssistantMessage {
  id: number;
  role: 'user' | 'assistant';
  text: string;
}

interface HouseholdBillForm {
  category: string;
  provider: string;
  dueDate: string;
  amount: number;
}

type MedicalExpense = MedicalExpenseSummary;

interface MedicalExpenseForm {
  serviceName: string;
  patientDetail: string;
  billDate: string;
  insuranceCovered: number;
  outOfPocketDue: number;
  status: 'Paid' | 'Pending';
}

interface CreditScoreFactor {
  name: string;
  weight: string;
  result: string;
  progress: number;
  color: 'green' | 'amber' | 'blue';
}

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <main class="auth-page" *ngIf="authView !== 'app'">
      <div class="auth-backdrop-glow" aria-hidden="true"></div>
      <section class="auth-layout" aria-label="FinTrack Pro account access">
        <div class="auth-intro">
          <a class="auth-brand" href="#dashboard" aria-label="FinTrack Pro">
            <span class="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 24 24"><path d="M5 5.5h14A1.5 1.5 0 0 1 20.5 7v10a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17V7A1.5 1.5 0 0 1 5 5.5Z"/><path d="M7 9h10M7 12h6"/></svg>
            </span>
            <span><strong>FinTrack Pro</strong><small>Wealth &amp; Debt Manager</small></span>
          </a>
          <div class="auth-pitch">
            <span class="auth-eyebrow">YOUR FINANCES, IN FOCUS</span>
            <h1>Make confident moves with your money.</h1>
            <p>A clearer view of your accounts, bills, credit, and goals—all in one calm workspace.</p>
            <div class="auth-feature-list">
              <div><span aria-hidden="true">✓</span><span><strong>See the whole picture</strong><small>Track balances, liabilities, and cash flow together.</small></span></div>
              <div><span aria-hidden="true">✓</span><span><strong>Stay ahead of due dates</strong><small>Keep bills and repayments organized.</small></span></div>
              <div><span aria-hidden="true">✓</span><span><strong>Build better money habits</strong><small>Turn everyday activity into useful insights.</small></span></div>
            </div>
          </div>
          <p class="auth-footer-note">A personal finance workspace designed around you.</p>
        </div>

        <section class="auth-card" [attr.aria-labelledby]="authView === 'login' ? 'login-title' : 'signup-title'">
          <ng-container *ngIf="authView === 'login'; else signupForm">
            <div class="auth-card-heading">
              <span class="auth-card-icon" aria-hidden="true">↗</span>
              <p>WELCOME BACK</p>
              <h2 id="login-title">Sign in to your account</h2>
              <span>Pick up where you left off.</span>
            </div>
            <form class="auth-form" #loginForm="ngForm" (ngSubmit)="submitAuthForm()">
              <label class="auth-field">
                <span>Email address</span>
                <input type="email" name="loginEmail" [(ngModel)]="authEmail" placeholder="you@example.com" autocomplete="email" required>
              </label>
              <label class="auth-field">
                <span>Password</span>
                <input type="password" name="loginPassword" [(ngModel)]="authPassword" placeholder="Enter your password" autocomplete="current-password" required>
              </label>
              <button class="auth-submit" type="submit" [disabled]="loginForm.invalid || authSubmitting">{{ authSubmitting ? 'Signing In…' : 'Sign In' }} <span aria-hidden="true">→</span></button>
            </form>
            <p class="auth-switch">New to FinTrack Pro? <button type="button" (click)="showSignup()">Create an account</button></p>
          </ng-container>
          <ng-template #signupForm>
            <div class="auth-card-heading">
              <span class="auth-card-icon" aria-hidden="true">✦</span>
              <p>GET STARTED</p>
              <h2 id="signup-title">Create your account</h2>
              <span>Set up your personal finance workspace.</span>
            </div>
            <form class="auth-form" #signupFormElement="ngForm" (ngSubmit)="submitAuthForm()">
              <label class="auth-field">
                <span>Full name</span>
                <input type="text" name="signupName" [(ngModel)]="authName" placeholder="Your name" autocomplete="name" minlength="2" maxlength="201" required>
              </label>
              <label class="auth-field">
                <span>Email address</span>
                <input type="email" name="signupEmail" [(ngModel)]="authEmail" placeholder="you@example.com" autocomplete="email" maxlength="255" required>
              </label>
              <label class="auth-field">
                <span>Password</span>
                <input type="password" name="signupPassword" [(ngModel)]="authPassword" placeholder="12+ characters, upper/lowercase and a number" autocomplete="new-password" minlength="12" maxlength="128" pattern="(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=\\S+$).{12,128}" required>
              </label>
              <label class="auth-field">
                <span>Confirm password</span>
                <input type="password" name="signupConfirmPassword" [(ngModel)]="authConfirmPassword" placeholder="Re-enter your password" autocomplete="new-password" minlength="12" maxlength="128" required>
              </label>
              <button class="auth-submit" type="submit" [disabled]="signupFormElement.invalid || authPassword !== authConfirmPassword || authSubmitting">{{ authSubmitting ? 'Creating Account…' : 'Create Account' }} <span aria-hidden="true">→</span></button>
            </form>
            <p class="auth-switch">Already have an account? <button type="button" (click)="showLogin()">Sign in</button></p>
          </ng-template>
          <p class="auth-notice" role="status" *ngIf="authNotice">{{ authNotice }}</p>
          <p class="auth-demo-note">Your password is securely hashed before it is stored. Authentication tokens remain in memory for this session.</p>
        </section>
      </section>
    </main>

    <div class="app-shell" *ngIf="authView === 'app'">
      <aside class="sidebar">
        <a class="brand" href="#dashboard" aria-label="FinTrack Pro home">
          <span class="brand-mark" aria-hidden="true">
            <svg viewBox="0 0 24 24"><path d="M5 5.5h14A1.5 1.5 0 0 1 20.5 7v10a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 17V7A1.5 1.5 0 0 1 5 5.5Z"/><path d="M7 9h10M7 12h6"/></svg>
          </span>
          <span class="brand-copy">
            <strong>FinTrack Pro</strong>
            <small>Wealth &amp; Debt Manager</small>
          </span>
        </a>

        <nav class="side-nav" aria-label="Main navigation">
          <div class="nav-group">
            <span class="nav-heading">Overview</span>
            <a class="nav-link" [class.selected]="currentPage === 'dashboard'" href="#dashboard" [attr.aria-current]="currentPage === 'dashboard' ? 'page' : null" (click)="showPage('dashboard')"><span class="nav-icon">◉</span>Dashboard</a>
            <a class="nav-link" [class.selected]="currentPage === 'bank-accounts'" href="#bank-accounts" [attr.aria-current]="currentPage === 'bank-accounts' ? 'page' : null" (click)="showPage('bank-accounts')"><span class="nav-icon">▤</span>Bank Accounts</a>
            <a class="nav-link" [class.selected]="currentPage === 'credit-score'" href="#credit-score" [attr.aria-current]="currentPage === 'credit-score' ? 'page' : null" (click)="showPage('credit-score')"><span class="nav-icon">◉</span>Credit Score</a>
          </div>
          <div class="nav-group">
            <span class="nav-heading">Expenses &amp; Bills</span>
            <a class="nav-link" [class.selected]="currentPage === 'household-bills'" href="#household-bills" [attr.aria-current]="currentPage === 'household-bills' ? 'page' : null" (click)="showPage('household-bills')"><span class="nav-icon">⌂</span>Household Bills</a>
            <a class="nav-link" [class.selected]="currentPage === 'medical-expenses'" href="#medical-expenses" [attr.aria-current]="currentPage === 'medical-expenses' ? 'page' : null" (click)="showPage('medical-expenses')"><span class="nav-icon">✚</span>Medical Expenses</a>
            <a class="nav-link" [class.selected]="currentPage === 'credit-cards'" href="#credit-cards" [attr.aria-current]="currentPage === 'credit-cards' ? 'page' : null" (click)="showPage('credit-cards')"><span class="nav-icon">▰</span>Credit Cards</a>
            <a class="nav-link" [class.selected]="currentPage === 'debit-transactions'" href="#debit-transactions" [attr.aria-current]="currentPage === 'debit-transactions' ? 'page' : null" (click)="showPage('debit-transactions')"><span class="nav-icon">▣</span>Debit Transactions</a>
          </div>
          <div class="nav-group">
            <span class="nav-heading">Loans &amp; Liabilities</span>
            <a class="nav-link" [class.selected]="currentPage === 'bank-loans'" href="#bank-loans" [attr.aria-current]="currentPage === 'bank-loans' ? 'page' : null" (click)="showPage('bank-loans')"><span class="nav-icon">▤</span>Bank Loans (EMI)</a>
            <a class="nav-link" [class.selected]="currentPage === 'fintech'" href="#fintech" [attr.aria-current]="currentPage === 'fintech' ? 'page' : null" (click)="showPage('fintech')"><span class="nav-icon">▯</span>Fintech / PayLater</a>
            <a class="nav-link" [class.selected]="currentPage === 'borrowings'" href="#borrowings" [attr.aria-current]="currentPage === 'borrowings' ? 'page' : null" (click)="showPage('borrowings')"><span class="nav-icon">◈</span>Other Borrowings</a>
          </div>
          <div class="nav-group">
            <span class="nav-heading">Income &amp; Intelligence</span>
            <a class="nav-link" [class.selected]="currentPage === 'other-income'" href="#other-income" [attr.aria-current]="currentPage === 'other-income' ? 'page' : null" (click)="showPage('other-income')"><span class="nav-icon">♙</span>Other Income</a>
            <a class="nav-link ai-link" [class.selected]="currentPage === 'ai-assistant'" href="#ai-assistant" [attr.aria-current]="currentPage === 'ai-assistant' ? 'page' : null" (click)="showPage('ai-assistant')"><span class="nav-icon">✿</span>AI Assistant</a>
          </div>
        </nav>

        <div class="profile">
          <span class="avatar">{{ profileInitials }}</span>
          <span class="profile-copy"><strong>{{ profileName }}</strong><small>{{ profileEmail }}</small></span>
          <button class="profile-add" type="button" aria-label="Sign out" title="Sign out" (click)="signOut()">↪</button>
        </div>
      </aside>

      <main class="main-content" id="dashboard">
        <header class="topbar">
          <div>
            <h1>{{ pageTitle }}</h1>
            <p>{{ pageDescription }}</p>
          </div>
          <div class="top-actions">
            <button type="button" class="button button-primary" aria-haspopup="dialog" (click)="openEntryModal()"><span aria-hidden="true">＋</span> Add Transaction / Liability</button>
            <button type="button" class="button button-ai" (click)="showPage('ai-assistant')"><span aria-hidden="true">✦</span> Ask AI</button>
          </div>
        </header>

        <div class="dashboard-content" *ngIf="currentPage === 'dashboard'">
          <section class="summary-grid" aria-label="Financial summary">
            <article class="summary-card">
              <div class="summary-heading"><span>Bank Balance</span><span class="summary-icon green">▤</span></div>
              <strong class="summary-value">$42,500.00</strong>
              <small class="summary-note positive">Across 3 Active Accounts</small>
            </article>
            <article class="summary-card">
              <div class="summary-heading"><span>Total Liabilities</span><span class="summary-icon red">↘</span></div>
              <strong class="summary-value negative">$203,330.00</strong>
              <small class="summary-note">Loans, Credit Cards &amp; Informal</small>
            </article>
            <article class="summary-card">
              <div class="summary-heading"><span>Monthly Due Bills</span><span class="summary-icon amber">▣</span></div>
              <strong class="summary-value">$3,420.00</strong>
              <small class="summary-note warning">4 Bills Pending Approval</small>
            </article>
            <article class="summary-card">
              <div class="summary-heading"><span>CIBIL / Credit Score</span><span class="summary-icon blue">◉</span></div>
              <strong class="summary-value score">{{ creditScore }} <small>/ 900</small></strong>
              <small class="summary-note">Excellent · Updated 5 days ago</small>
            </article>
          </section>

          <section class="charts-grid" aria-label="Financial charts">
            <article class="panel cashflow-panel">
              <div class="panel-heading">
                <h2>Monthly Cashflow Overview</h2>
                <span>Past 6 Months</span>
              </div>
              <div class="chart-legend">
                <span><i class="legend-line income"></i>Income ($)</span>
                <span><i class="legend-line expenses"></i>Expenses &amp; Dues ($)</span>
              </div>
              <div class="line-chart">
                <div class="y-labels" aria-hidden="true"><span>6,000</span><span>5,500</span><span>5,000</span><span>4,500</span><span>4,000</span><span>3,500</span><span>3,000</span></div>
                <svg viewBox="0 0 700 150" preserveAspectRatio="none" role="img" aria-label="Income rose from 4,500 dollars in May to 5,800 dollars in October. Expenses ranged from 3,100 to 3,600 dollars.">
                  <defs>
                    <linearGradient id="incomeFill" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#00b989" stop-opacity=".18"/><stop offset="1" stop-color="#00b989" stop-opacity=".02"/></linearGradient>
                  </defs>
                  <path class="grid-line" d="M0 5H700M0 28H700M0 51H700M0 74H700M0 97H700M0 120H700M0 143H700"/>
                  <path class="grid-line vertical" d="M0 5V143M140 5V143M280 5V143M420 5V143M560 5V143M699 5V143"/>
                  <path class="income-area" d="M0 73 C48 68 94 61 140 59 S234 66 280 64 S374 45 420 43 S514 50 560 47 S654 22 699 13 V143 H0Z"/>
                  <path class="income-path" d="M0 73 C48 68 94 61 140 59 S234 66 280 64 S374 45 420 43 S514 50 560 47 S654 22 699 13"/>
                  <path class="expense-path" d="M0 139 C46 136 96 128 140 125 S234 134 280 132 S375 115 420 116 S514 137 560 134 S654 124 699 124"/>
                  <g class="chart-points income-points"><circle cx="0" cy="73" r="2.6"/><circle cx="140" cy="59" r="2.6"/><circle cx="280" cy="64" r="2.6"/><circle cx="420" cy="43" r="2.6"/><circle cx="560" cy="47" r="2.6"/><circle cx="699" cy="13" r="2.6"/></g>
                  <g class="chart-points expense-points"><circle cx="0" cy="139" r="2.6"/><circle cx="140" cy="125" r="2.6"/><circle cx="280" cy="132" r="2.6"/><circle cx="420" cy="116" r="2.6"/><circle cx="560" cy="134" r="2.6"/><circle cx="699" cy="124" r="2.6"/></g>
                </svg>
                <div class="x-labels" aria-hidden="true"><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span><span>Oct</span></div>
              </div>
            </article>

            <article class="panel liabilities-panel">
              <div class="panel-heading">
                <h2>Liabilities Breakdown</h2>
                <span>By Type</span>
              </div>
              <div class="donut-wrap">
                <div class="donut-chart" role="img" aria-label="Liabilities by type: Home Loan 78%, Personal Loan 12%, Credit Cards 5%, Fintech Apps 3%, and Informal 2%.">
                  <div class="donut-hole"></div>
                </div>
              </div>
              <div class="donut-legend">
                <span><i class="home-loan"></i>Home Loan</span>
                <span><i class="personal-loan"></i>Personal Loan</span>
                <span><i class="credit-cards"></i>Credit Cards</span>
                <span><i class="fintech-apps"></i>Fintech Apps</span>
                <span><i class="informal"></i>Informal</span>
              </div>
            </article>
          </section>

          <section class="bottom-grid" aria-label="Upcoming actions and insights">
            <article class="panel dues-panel">
              <div class="panel-heading">
                <h2>Immediate Dues &amp; Upcoming Actions</h2>
                <button class="text-button" type="button">View All</button>
              </div>
              <div class="due-list">
                <div class="due-row" *ngFor="let item of dueItems">
                  <span class="due-icon" aria-hidden="true">▣</span>
                  <span class="due-description"><strong>{{ item.name }}</strong><small>{{ item.category ? item.category + ' · ' : '' }}Due: {{ item.dueDate }}</small></span>
                  <span class="due-amount"><strong>{{ item.amount | currency:'USD':'symbol':'1.2-2' }}</strong><small>{{ item.status }}</small></span>
                </div>
              </div>
            </article>

            <article class="panel insight-panel">
              <ng-container *ngIf="showInsight">
                <div class="insight-title"><span class="sparkle" aria-hidden="true">✿</span><h2>FinTrack AI Smart Digest</h2></div>
                <h3>Debt Reduction Opportunity Detected</h3>
                <p>You have an excess balance of <strong>$5,200</strong> in your high-yield checking account. Consider making an extra principal payment on your personal loan (interest: 11.5%) to save roughly <strong class="savings">$480/yr</strong> in interest costs.</p>
                <div class="insight-actions">
                  <button type="button" class="button button-consult" (click)="showPage('ai-assistant')">Consult AI Assistant</button>
                  <button type="button" class="text-button dismiss-button" (click)="showInsight = false">Dismiss</button>
                </div>
              </ng-container>
              <div class="insight-actions" *ngIf="!showInsight">
                <button type="button" class="text-button" (click)="showInsight = true">Restore insight</button>
              </div>
            </article>
          </section>
        </div>

        <section class="bank-accounts-page" id="bank-accounts" *ngIf="currentPage === 'bank-accounts'" aria-labelledby="accounts-heading">
          <div class="accounts-heading">
            <h2 id="accounts-heading">Primary Bank Accounts</h2>
            <button type="button" class="button button-primary add-account-button" aria-haspopup="dialog" (click)="openBankAccountModal()">
              <span aria-hidden="true">＋</span> Add Bank Account
            </button>
          </div>
          <p class="household-bills-error" *ngIf="bankAccountsError" role="alert">{{ bankAccountsError }}</p>
          <p class="empty-accounts" *ngIf="bankAccountsLoading">Loading bank accounts…</p>
          <div class="account-grid">
            <article class="account-card" *ngFor="let account of bankAccounts">
              <div class="account-card-top">
                <span class="account-type">{{ account.accountType }}</span>
                <span class="account-bank-icon" aria-hidden="true">▤</span>
              </div>
              <h3>{{ account.bankName }}</h3>
              <p class="account-number">**** **** {{ account.lastFour }}</p>
              <div class="account-balance">
                <div>
                  <span class="balance-label">Available Balance</span>
                  <strong>{{ account.balance | currency:'USD':'symbol':'1.2-2' }}</strong>
                </div>
                <small>IFSC: {{ account.ifsc }}</small>
              </div>
              <div class="household-bill-actions">
                <button
                  type="button"
                  class="household-bill-action-button"
                  [attr.aria-label]="'Edit ' + account.bankName + ' account'"
                  title="Edit account"
                  [disabled]="bankAccountSaving || bankAccountDeletingId !== null"
                  (click)="editBankAccount(account)">
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m14 5 5 5M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z"/></svg>
                </button>
                <button
                  type="button"
                  class="household-bill-action-button household-bill-action-delete"
                  [attr.aria-label]="'Delete ' + account.bankName + ' account'"
                  title="Delete account"
                  [disabled]="bankAccountSaving || bankAccountDeletingId !== null"
                  (click)="deleteBankAccount(account)">
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m3 3v7m6-7v7"/></svg>
                </button>
              </div>
            </article>
          </div>
          <p class="empty-accounts" *ngIf="!bankAccountsLoading && !bankAccountsError && bankAccounts.length === 0">No bank accounts yet. Add an account to see it here.</p>
        </section>

        <section class="credit-score-page" id="credit-score" *ngIf="currentPage === 'credit-score'" aria-label="Credit score and health report">
          <article class="credit-health-card">
            <h2>CIBIL / Experian Credit Health</h2>
            <div class="score-gauge" role="img" [attr.aria-label]="'Credit score: ' + creditScore + ' out of 900'">
              <svg viewBox="0 0 220 124" aria-hidden="true">
                <path class="gauge-track" d="M 12 112 A 98 98 0 0 1 208 112"></path>
                <path class="gauge-value" d="M 12 112 A 98 98 0 0 1 208 112" [attr.stroke-dasharray]="scoreArcLength + ' 307.88'"></path>
              </svg>
              <div class="gauge-score">
                <strong>{{ creditScore }}</strong>
                <span>Out of 900</span>
              </div>
            </div>
            <span class="score-status">{{ scoreStatus }}</span>
            <p class="score-sync">Last sync with bureau: {{ reportDate | date:'MMMM yyyy' }}</p>
            <p class="credit-score-error" *ngIf="creditScoreError">{{ creditScoreError }}</p>
          </article>

          <article class="score-factors-card" aria-labelledby="score-factors-heading">
            <h2 id="score-factors-heading">Score Factor Breakdown</h2>
            <div class="factor-list">
              <div class="factor-row" *ngFor="let factor of creditScoreFactors">
                <div class="factor-copy">
                  <span>{{ factor.name }} <small>({{ factor.weight }})</small></span>
                  <strong [class]="factor.color">{{ factor.result }}</strong>
                </div>
                <div class="factor-track" role="progressbar" [attr.aria-label]="factor.name" [attr.aria-valuenow]="factor.progress" aria-valuemin="0" aria-valuemax="100">
                  <span [class]="factor.color" [style.width.%]="factor.progress"></span>
                </div>
              </div>
            </div>
          </article>
        </section>

        <section class="credit-cards-page" id="credit-cards" *ngIf="currentPage === 'credit-cards'" aria-labelledby="credit-cards-heading">
          <div class="credit-cards-heading">
            <h2 id="credit-cards-heading">Credit Card Statements &amp; Limits</h2>
            <button type="button" class="button button-primary add-credit-card-button" aria-haspopup="dialog" (click)="openCreditCardModal()">
              <span aria-hidden="true">＋</span> Add Credit Card
            </button>
          </div>
          <div class="credit-card-grid">
            <p class="empty-credit-cards" *ngIf="creditCardsLoading">Loading credit card statements...</p>
            <p class="household-bills-error" *ngIf="!creditCardsLoading && creditCardsError" role="alert">{{ creditCardsError }}</p>
            <article class="credit-card-item" *ngFor="let card of creditCards; trackBy: trackCreditCard">
              <div class="credit-card-title">
                <h3>{{ card.name }}</h3>
                <span aria-hidden="true">▰</span>
              </div>
              <div class="credit-card-balance">
                <span>Statement Balance</span>
                <strong>{{ card.statementBalance | currency:'USD':'symbol':'1.2-2' }}</strong>
              </div>
              <div class="credit-card-detail"><span>Minimum Due:</span><strong>{{ card.minimumDue | currency:'USD':'symbol':'1.2-2' }}</strong></div>
              <div class="credit-card-detail"><span>Due Date:</span><strong class="credit-card-due-date">{{ card.dueDate }}</strong></div>
              <div class="credit-card-utilization">
                <div class="credit-card-utilization-label">
                  <span>Limit Utilization ({{ creditCardUtilization(card) }}%)</span>
                  <span>{{ card.creditLimit | currency:'USD':'symbol':'1.0-0' }} Limit</span>
                </div>
                <div class="credit-card-utilization-track" role="progressbar" [attr.aria-label]="card.name + ' credit limit utilization'" [attr.aria-valuenow]="creditCardUtilization(card)" aria-valuemin="0" aria-valuemax="100">
                  <span [style.width.%]="creditCardUtilization(card)"></span>
                </div>
              </div>
              <div class="household-bill-actions">
                <button type="button" class="household-bill-action-button" [attr.aria-label]="'Edit ' + card.name" title="Edit credit card" [disabled]="creditCardSaving || creditCardDeletingId !== null" (click)="editCreditCard(card)">
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m14 5 5 5M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z"/></svg>
                </button>
                <button type="button" class="household-bill-action-button household-bill-action-delete" [attr.aria-label]="'Delete ' + card.name" title="Delete credit card" [disabled]="creditCardSaving || creditCardDeletingId !== null" (click)="deleteCreditCard(card)">
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m3 3v7m6-7v7"/></svg>
                </button>
              </div>
            </article>
            <p class="empty-credit-cards" *ngIf="!creditCardsLoading && !creditCardsError && creditCards.length === 0">No credit cards yet. Add a card to track statements and limits.</p>
          </div>
        </section>

        <section class="debit-transactions-page" id="debit-transactions" *ngIf="currentPage === 'debit-transactions'" aria-labelledby="debit-transactions-heading">
          <div class="debit-transactions-heading">
            <h2 id="debit-transactions-heading">Debit Account Transactions Log</h2>
            <button type="button" class="button button-primary add-debit-transaction-button" aria-haspopup="dialog" (click)="openDebitTransactionModal()">
              <span aria-hidden="true">＋</span> Record Debit Expense
            </button>
          </div>
          <div class="bill-table-wrap">
            <table class="bill-table debit-transactions-table">
              <thead>
                <tr>
                  <th scope="col">Date</th>
                  <th scope="col">Bank Account</th>
                  <th scope="col">Merchant / Category</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Type</th>
                  <th scope="col" class="bill-action-heading">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let transaction of debitTransactions; trackBy: trackDebitTransaction">
                  <td>{{ transaction.date }}</td>
                  <th scope="row">{{ transaction.bankAccount }}</th>
                  <td>{{ transaction.merchant }}</td>
                  <td class="debit-transaction-amount">-{{ transaction.amount | currency:'USD':'symbol':'1.2-2' }}</td>
                  <td><span class="debit-transaction-category">{{ transaction.category }}</span></td>
                  <td class="bill-action-cell">
                    <div class="household-bill-actions">
                      <button type="button" class="household-bill-action-button" [attr.aria-label]="'Edit transaction at ' + transaction.merchant" title="Edit transaction" [disabled]="debitTransactionSaving || debitTransactionDeletingId !== null" (click)="editDebitTransaction(transaction)">
                        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m14 5 5 5M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z"/></svg>
                      </button>
                      <button type="button" class="household-bill-action-button household-bill-action-delete" [attr.aria-label]="'Delete transaction at ' + transaction.merchant" title="Delete transaction" [disabled]="debitTransactionSaving || debitTransactionDeletingId !== null" (click)="deleteDebitTransaction(transaction)">
                        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m3 3v7m6-7v7"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="!debitTransactionsLoading && !debitTransactionsError && debitTransactions.length === 0">
                  <td class="empty-bills" colspan="6">No debit expenses yet. Record an expense to get started.</td>
                </tr>
                <tr *ngIf="debitTransactionsLoading">
                  <td class="empty-bills" colspan="6">Loading debit transactions...</td>
                </tr>
                <tr *ngIf="debitTransactionsError">
                  <td class="empty-bills" colspan="6" role="alert">{{ debitTransactionsError }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="bank-loans-page" id="bank-loans" *ngIf="currentPage === 'bank-loans'" aria-labelledby="bank-loans-heading">
          <div class="bank-loans-heading">
            <h2 id="bank-loans-heading">Active Bank Loans (Personal &amp; Housing)</h2>
            <button type="button" class="button button-primary add-bank-loan-button" aria-haspopup="dialog" (click)="openBankLoanModal()">
              <span aria-hidden="true">＋</span> Add Bank Loan
            </button>
          </div>
          <div class="bank-loan-grid">
            <p class="empty-bank-loans" *ngIf="bankLoansLoading">Loading bank loans...</p>
            <p class="empty-bank-loans" *ngIf="!bankLoansLoading && bankLoansError" role="alert">{{ bankLoansError }}</p>
            <article class="bank-loan-card" *ngFor="let loan of bankLoans; trackBy: trackBankLoan">
              <div class="bank-loan-card-heading">
                <span class="bank-loan-type">{{ loan.type }}</span>
                <span class="bank-loan-interest">Int Rate: <strong>{{ loan.interestRate }}%</strong></span>
              </div>
              <h3>{{ loan.lender }}</h3>
              <div class="bank-loan-balance-row">
                <div>
                  <span>Monthly EMI</span>
                  <strong>{{ loan.monthlyEmi | currency:'USD':'symbol':'1.2-2' }}</strong>
                </div>
                <div>
                  <span>Principal Remaining</span>
                  <strong class="principal-remaining">{{ loan.principalRemaining | currency:'USD':'symbol':'1.0-0' }}</strong>
                </div>
              </div>
              <p class="bank-loan-term"><span aria-hidden="true">◷</span> {{ loan.yearsRemaining }} Yrs Remaining</p>
              <div class="household-bill-actions">
                <button type="button" class="household-bill-action-button" [attr.aria-label]="'Edit ' + loan.lender + ' loan'" title="Edit bank loan" [disabled]="bankLoanSaving || bankLoanDeletingId !== null" (click)="editBankLoan(loan)">
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m14 5 5 5M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z"/></svg>
                </button>
                <button type="button" class="household-bill-action-button household-bill-action-delete" [attr.aria-label]="'Delete ' + loan.lender + ' loan'" title="Delete bank loan" [disabled]="bankLoanSaving || bankLoanDeletingId !== null" (click)="deleteBankLoan(loan)">
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m3 3v7m6-7v7"/></svg>
                </button>
              </div>
            </article>
            <p class="empty-bank-loans" *ngIf="!bankLoansLoading && !bankLoansError && bankLoans.length === 0">No bank loans yet. Add a loan to track your EMI and remaining principal.</p>
          </div>
        </section>

        <section class="fintech-page" id="fintech" *ngIf="currentPage === 'fintech'" aria-labelledby="fintech-heading">
          <div class="fintech-heading">
            <h2 id="fintech-heading">Fintech Apps &amp; Instant PayLater Credit</h2>
            <button type="button" class="button button-primary add-app-loan-button" aria-haspopup="dialog" (click)="openAppLoanModal()">
              <span aria-hidden="true">＋</span> Add App Loan
            </button>
          </div>
          <div class="app-loan-grid">
            <p class="empty-app-loans" *ngIf="appLoansLoading">Loading app loans...</p>
            <p class="household-bills-error" *ngIf="!appLoansLoading && appLoansError" role="alert">{{ appLoansError }}</p>
            <article class="app-loan-card" *ngFor="let loan of appLoans; trackBy: trackAppLoan">
              <div class="app-loan-card-heading">
                <h3>{{ loan.appName }}</h3>
                <span class="app-loan-icon" aria-hidden="true">▯</span>
              </div>
              <strong class="app-loan-balance">{{ loan.outstandingBalance | currency:'USD':'symbol':'1.2-2' }}</strong>
              <div class="app-loan-details">
                <span>Next EMI:</span>
                <strong>{{ loan.nextEmi | currency:'USD':'symbol':'1.2-2' }}</strong>
                <span>Due Date:</span>
                <strong class="app-loan-due-date">{{ loan.dueDate }}</strong>
              </div>
              <div class="household-bill-actions">
                <button type="button" class="household-bill-action-button" [attr.aria-label]="'Edit ' + loan.appName + ' loan'" title="Edit app loan" [disabled]="appLoanSaving || appLoanDeletingId !== null" (click)="editAppLoan(loan)">
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m14 5 5 5M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z"/></svg>
                </button>
                <button type="button" class="household-bill-action-button household-bill-action-delete" [attr.aria-label]="'Delete ' + loan.appName + ' loan'" title="Delete app loan" [disabled]="appLoanSaving || appLoanDeletingId !== null" (click)="deleteAppLoan(loan)">
                  <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m3 3v7m6-7v7"/></svg>
                </button>
              </div>
            </article>
            <p class="empty-app-loans" *ngIf="!appLoansLoading && !appLoansError && appLoans.length === 0">No app loans yet. Add a PayLater or app loan to track its balance and due date.</p>
          </div>
        </section>

        <section class="borrowings-page" id="borrowings" *ngIf="currentPage === 'borrowings'" aria-labelledby="borrowings-heading">
          <div class="borrowings-heading">
            <h2 id="borrowings-heading">Personal &amp; Informal Borrowings</h2>
            <button type="button" class="button button-primary record-borrowing-button" aria-haspopup="dialog" (click)="openBorrowingModal()">
              <span aria-hidden="true">＋</span> Record Borrowing
            </button>
          </div>
          <div class="borrowings-table-wrap">
            <table class="borrowings-table">
              <thead>
                <tr>
                  <th scope="col">Lender Name</th>
                  <th scope="col">Relationship / Notes</th>
                  <th scope="col">Initial Amount</th>
                  <th scope="col">Remaining Balance</th>
                  <th scope="col">Target Repayment</th>
                  <th scope="col" class="borrowing-action-heading">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngIf="informalBorrowingsLoading">
                  <td class="empty-borrowings" colspan="6">Loading other borrowings...</td>
                </tr>
                <tr *ngIf="!informalBorrowingsLoading && informalBorrowingsError">
                  <td class="empty-borrowings" colspan="6" role="alert">{{ informalBorrowingsError }}</td>
                </tr>
                <tr *ngFor="let borrowing of informalBorrowings; trackBy: trackInformalBorrowing">
                  <th scope="row">{{ borrowing.lender }}</th>
                  <td>{{ borrowing.notes }}</td>
                  <td>{{ borrowing.initialAmount | currency:'USD':'symbol':'1.2-2' }}</td>
                  <td class="borrowing-remaining">{{ borrowing.remainingBalance | currency:'USD':'symbol':'1.2-2' }}</td>
                  <td>{{ borrowing.targetRepaymentDate }}</td>
                  <td class="borrowing-action-cell">
                    <button
                      type="button"
                      class="record-payback-button"
                      [disabled]="borrowing.remainingBalance === 0 || paybackSaving"
                      (click)="openPaybackModal(borrowing)">Record Payback</button>
                  </td>
                </tr>
                <tr *ngIf="!informalBorrowingsLoading && !informalBorrowingsError && informalBorrowings.length === 0">
                  <td class="empty-borrowings" colspan="6">No personal or informal borrowings yet. Record a borrowing to get started.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="other-income-page" id="other-income" *ngIf="currentPage === 'other-income'" aria-labelledby="other-income-heading">
          <div class="other-income-heading">
            <h2 id="other-income-heading">Alternative Income Streams</h2>
            <button type="button" class="button button-primary add-income-source-button" aria-haspopup="dialog" (click)="openIncomeSourceModal()">
              <span aria-hidden="true">＋</span> Add Income Source
            </button>
          </div>
          <div class="income-source-grid">
            <p class="empty-income-sources" *ngIf="incomeSourcesLoading">Loading income sources...</p>
            <p class="household-bills-error" *ngIf="!incomeSourcesLoading && incomeSourcesError" role="alert">{{ incomeSourcesError }}</p>
            <article class="income-source-card" *ngFor="let source of incomeSources; trackBy: trackIncomeSource">
              <div class="income-source-meta">
                <span class="income-source-category">{{ source.category }}</span>
                <span>{{ source.frequency }}</span>
              </div>
              <h3>{{ source.name }}</h3>
              <strong class="income-source-amount">+{{ source.amount | currency:'USD':'symbol':'1.2-2' }}</strong>
            </article>
            <p class="empty-income-sources" *ngIf="!incomeSourcesLoading && !incomeSourcesError && incomeSources.length === 0">No additional income sources yet. Add a source to track your alternative income.</p>
          </div>
        </section>

        <section class="assistant-page" id="ai-assistant" *ngIf="currentPage === 'ai-assistant'" aria-label="AI Financial Assistant">
          <div class="assistant-chat">
            <header class="assistant-header">
              <span class="assistant-avatar" aria-hidden="true">✿</span>
              <div class="assistant-heading-copy">
                <h2>FinTrack AI Advisor</h2>
                <p>Personalized guidance based on the financial data in this demo</p>
              </div>
              <button type="button" class="clear-chat-button" (click)="clearAssistantChat()" [disabled]="assistantMessages.length === 0">Clear Chat</button>
            </header>
            <div class="assistant-conversation" aria-live="polite" aria-label="Conversation">
              <div class="assistant-message-row">
                <span class="assistant-message-icon" aria-hidden="true">✿</span>
                <div class="assistant-message assistant-welcome">
                  <p>Hello John! I can help you explore the financial data currently shown in your dashboard.</p>
                  <span>You can ask me questions like:</span>
                  <ul>
                    <li>"How can I optimize my loan repayment strategy?"</li>
                    <li>"Summarize my upcoming monthly bill obligations."</li>
                    <li>"What is my current net worth and liquid position?"</li>
                  </ul>
                  <small>Demo mode: responses are generated locally; no external AI service is connected.</small>
                </div>
              </div>
              <div class="assistant-message-row" *ngFor="let message of assistantMessages; trackBy: trackAssistantMessage" [class.user-message-row]="message.role === 'user'">
                <span class="assistant-message-icon" aria-hidden="true" *ngIf="message.role === 'assistant'">✿</span>
                <div class="assistant-message" [class.user-message]="message.role === 'user'">{{ message.text }}</div>
              </div>
            </div>
            <form class="assistant-composer" (ngSubmit)="sendAssistantMessage()">
              <label class="visually-hidden" for="assistant-prompt">Ask a financial question</label>
              <textarea
                id="assistant-prompt"
                name="assistantPrompt"
                [(ngModel)]="assistantPrompt"
                placeholder="Ask financial advice or budget questions..."
                rows="1"
                maxlength="1000"
                (keydown.enter)="sendAssistantMessageOnEnter($event)"></textarea>
              <button type="submit" class="assistant-send-button" [disabled]="!assistantPrompt.trim()">
                Send <span aria-hidden="true">➤</span>
              </button>
            </form>
          </div>
        </section>

        <section class="household-bills-page" id="household-bills" *ngIf="currentPage === 'household-bills'" aria-labelledby="household-bills-heading">
          <div class="household-bills-heading">
            <h2 id="household-bills-heading">Household Utility &amp; Recurring Bills</h2>
            <button type="button" class="button button-primary add-household-bill-button" aria-haspopup="dialog" (click)="openHouseholdBillModal()">
              <span aria-hidden="true">＋</span> Add Household Bill
            </button>
          </div>
          <div class="bill-table-wrap">
            <table class="bill-table">
              <thead>
                <tr>
                  <th scope="col">Bill Type</th>
                  <th scope="col">Provider / Description</th>
                  <th scope="col">Due Date</th>
                  <th scope="col">Amount</th>
                  <th scope="col">Status</th>
                  <th scope="col" class="bill-action-heading">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let bill of householdBills; trackBy: trackBill">
                  <th scope="row">{{ bill.category }}</th>
                  <td>{{ bill.provider }}</td>
                  <td>{{ bill.dueDate }}</td>
                  <td class="bill-amount">{{ bill.amount | currency:'USD':'symbol':'1.2-2' }}</td>
                  <td>
                    <span class="bill-status" [class.paid]="bill.status === 'Paid'">{{ bill.status === 'Paid' ? 'Completed' : bill.status }}</span>
                  </td>
                  <td class="bill-action-cell">
                    <div class="household-bill-actions">
                      <button
                        type="button"
                        class="mark-paid-button"
                        *ngIf="bill.status !== 'Paid'"
                        [attr.aria-label]="'Mark ' + bill.category + ' paid'"
                        [disabled]="householdBillSaving || householdBillDeletingId !== null"
                        (click)="markBillPaid(bill)">
                        Mark Paid
                      </button>
                      <button
                        type="button"
                        class="household-bill-action-button"
                        [attr.aria-label]="'Edit ' + bill.category + ' bill'"
                        title="Edit bill"
                        [disabled]="householdBillSaving || householdBillDeletingId !== null"
                        (click)="editHouseholdBill(bill)">
                        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="m14 5 5 5M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z"/></svg>
                      </button>
                      <button
                        type="button"
                        class="household-bill-action-button household-bill-action-delete"
                        [attr.aria-label]="'Delete ' + bill.category + ' bill'"
                        title="Delete bill"
                        [disabled]="householdBillSaving || householdBillDeletingId !== null"
                        (click)="deleteHouseholdBill(bill)">
                        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m3 3v7m6-7v7"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="!householdBillsLoading && householdBills.length === 0">
                  <td class="empty-bills" colspan="6">No household bills yet. Add a bill to get started.</td>
                </tr>
                <tr *ngIf="householdBillsLoading">
                  <td class="empty-bills" colspan="6">Loading household bills…</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p class="household-bills-error" *ngIf="householdBillsError">{{ householdBillsError }}</p>
          <p class="household-bills-error" *ngIf="householdBillSuccessMessage" role="status" aria-live="polite" style="color: #18d89a">{{ householdBillSuccessMessage }}</p>
        </section>

        <section class="medical-expenses-page" id="medical-expenses" *ngIf="currentPage === 'medical-expenses'" aria-labelledby="medical-expenses-heading">
          <div class="medical-expenses-heading">
            <h2 id="medical-expenses-heading">Medical, Doctors &amp; Medication Expenses</h2>
            <button type="button" class="button button-primary add-medical-expense-button" aria-haspopup="dialog" (click)="openMedicalExpenseModal()">
              <span aria-hidden="true">＋</span> Log Medical Expense
            </button>
          </div>
          <div class="bill-table-wrap">
            <table class="bill-table medical-expense-table">
              <thead>
                <tr>
                  <th scope="col">Service / Hospital</th>
                  <th scope="col">Patient / Detail</th>
                  <th scope="col">Bill Date</th>
                  <th scope="col">Insurance Covered</th>
                  <th scope="col">Out-of-Pocket Due</th>
                  <th scope="col">Status</th>
                  <th scope="col" class="bill-action-heading">Action</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let expense of medicalExpenses; trackBy: trackMedicalExpense">
                  <th scope="row">{{ expense.serviceName }}</th>
                  <td>{{ expense.patientDetail }}</td>
                  <td>{{ expense.billDate }}</td>
                  <td class="insurance-covered">{{ expense.insuranceCovered | currency:'USD':'symbol':'1.2-2' }}</td>
                  <td class="bill-amount">{{ expense.outOfPocketDue | currency:'USD':'symbol':'1.2-2' }}</td>
                  <td>
                    <span class="medical-status" [class.paid]="expense.status === 'Paid'" [class.pending]="expense.status === 'Pending'">{{ expense.status }}</span>
                  </td>
                  <td class="bill-action-cell">
                    <div class="medical-expense-actions">
                      <button type="button" class="medical-action-button" [attr.aria-label]="'View ' + expense.serviceName + ' medical expense'" title="View" (click)="openMedicalClaim(expense)">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M2.5 12s3.4-6 9.5-6 9.5 6 9.5 6-3.4 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></svg>
                      </button>
                      <button type="button" class="medical-action-button" [attr.aria-label]="'Edit ' + expense.serviceName + ' medical expense'" title="Edit" [disabled]="medicalExpenseSaving || medicalExpenseDeletingId === expense.id" (click)="editMedicalExpense(expense)">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m14 5 5 5M4 20l4.5-1 11-11a2.1 2.1 0 0 0-3-3l-11 11L4 20Z"/></svg>
                      </button>
                      <button type="button" class="medical-action-button medical-action-delete" [attr.aria-label]="'Delete ' + expense.serviceName + ' medical expense'" title="Delete" [disabled]="medicalExpenseDeletingId === expense.id || medicalExpenseSaving" (click)="deleteMedicalExpense(expense)">
                        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M9 7V4h6v3m3 0-1 13H7L6 7m3 3v7m6-7v7"/></svg>
                      </button>
                    </div>
                  </td>
                </tr>
                <tr *ngIf="medicalExpensesLoading">
                  <td class="empty-bills" colspan="7">Loading medical expenses…</td>
                </tr>
                <tr *ngIf="!medicalExpensesLoading && medicalExpenses.length === 0">
                  <td class="empty-bills" colspan="7">No medical expenses yet. Log an expense to get started.</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p
            class="medical-expense-operation-feedback"
            *ngIf="medicalExpenseOperationMessage"
            [class.success]="medicalExpenseOperationSucceeded"
            [class.failure]="!medicalExpenseOperationSucceeded"
            [attr.role]="medicalExpenseOperationSucceeded ? 'status' : 'alert'"
            aria-live="polite">
            {{ medicalExpenseOperationMessage }}
          </p>
          <p class="household-bills-error" *ngIf="medicalExpensesError">{{ medicalExpensesError }}</p>
        </section>
      </main>
    </div>

    <div class="modal-backdrop" *ngIf="showEntryModal" (click)="closeEntryModal()">
      <section
        class="entry-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="entry-dialog-title"
        (click)="$event.stopPropagation()">
        <header class="dialog-header">
          <h2 id="entry-dialog-title">Add Entry</h2>
          <button type="button" class="dialog-close" aria-label="Close dialog" (click)="closeEntryModal()">×</button>
        </header>
        <form #entryForm="ngForm" (ngSubmit)="saveEntry()">
          <div class="dialog-fields">
            <label class="form-field">
              <span>Title / Provider</span>
              <input
                type="text"
                name="entryName"
                [(ngModel)]="entryFormValues.name"
                placeholder="e.g., Chase Bank, EB Power Bill"
                autocomplete="off"
                autofocus
                required>
            </label>
            <label class="form-field">
              <span>Amount ($)</span>
              <input
                type="number"
                name="entryAmount"
                [(ngModel)]="entryFormValues.amount"
                placeholder="0.00"
                min="0.01"
                step="0.01"
                required>
            </label>
            <label class="form-field">
              <span>Category / Subtype</span>
              <input
                type="text"
                name="entryCategory"
                [(ngModel)]="entryFormValues.category"
                placeholder="e.g., Electricity, Checking Account, Personal Loan"
                autocomplete="off"
                required>
            </label>
            <label class="form-field">
              <span>Date / Due Date</span>
              <input
                type="date"
                name="entryDueDate"
                [(ngModel)]="entryFormValues.dueDate"
                required>
            </label>
          </div>
          <footer class="dialog-footer">
            <button type="button" class="button button-cancel" (click)="closeEntryModal()">Cancel</button>
            <button
              type="submit"
              class="button button-save"
              [disabled]="entryForm.invalid || !entryFormValues.name.trim() || !entryFormValues.category.trim() || entryFormValues.amount <= 0">
              Save Item
            </button>
          </footer>
        </form>
      </section>
    </div>

    <div class="modal-backdrop" *ngIf="showBankAccountModal" (click)="closeBankAccountModal()">
      <section
        class="entry-dialog bank-account-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bank-account-dialog-title"
        (click)="$event.stopPropagation()">
        <header class="dialog-header">
          <h2 id="bank-account-dialog-title">{{ editingBankAccountId ? 'Edit Bank Account' : 'Add Bank Account' }}</h2>
          <button type="button" class="dialog-close" aria-label="Close dialog" (click)="closeBankAccountModal()">×</button>
        </header>
        <form #bankAccountForm="ngForm" (ngSubmit)="saveBankAccount()">
          <div class="dialog-fields">
            <label class="form-field">
              <span>Bank Name</span>
              <input
                type="text"
                name="bankName"
                [(ngModel)]="bankAccountFormValues.bankName"
                placeholder="e.g., HDFC Bank"
                autocomplete="organization"
                required>
            </label>
            <label class="form-field">
              <span>Account Type</span>
              <select name="accountType" [(ngModel)]="bankAccountFormValues.accountType" required>
                <option value="Checking Account">Checking Account</option>
                <option value="Savings Account">Savings Account</option>
                <option value="High-Yield Reserve">High-Yield Reserve</option>
              </select>
            </label>
            <div class="account-form-row">
              <label class="form-field">
                <span>Last 4 Digits</span>
                <input
                  type="text"
                  name="lastFour"
                  [(ngModel)]="bankAccountFormValues.lastFour"
                  inputmode="numeric"
                  pattern="[0-9]{4}"
                  minlength="4"
                  maxlength="4"
                  placeholder="e.g., 4819"
                  autocomplete="off"
                  required>
              </label>
              <label class="form-field">
                <span>Available Balance ($)</span>
                <input
                  type="number"
                  name="balance"
                  [(ngModel)]="bankAccountFormValues.balance"
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                  required>
              </label>
            </div>
            <label class="form-field">
              <span>IFSC Code</span>
              <input
                type="text"
                name="ifsc"
                [(ngModel)]="bankAccountFormValues.ifsc"
                placeholder="e.g., HDFC0001234"
                autocomplete="off"
                required>
            </label>
          </div>
          <p class="household-bills-error" *ngIf="bankAccountSaveError" role="alert">{{ bankAccountSaveError }}</p>
          <footer class="dialog-footer">
            <button type="button" class="button button-cancel" (click)="closeBankAccountModal()">Cancel</button>
            <button
              type="submit"
              class="button button-save"
              [disabled]="bankAccountForm.invalid || !canSaveBankAccount() || bankAccountSaving">
              {{ bankAccountSaving ? (editingBankAccountId ? 'Updating…' : 'Saving…') : (editingBankAccountId ? 'Update Account' : 'Save Account') }}
            </button>
          </footer>
        </form>
      </section>
    </div>

    <div class="modal-backdrop" *ngIf="showCreditCardModal" (click)="closeCreditCardModal()">
      <section
        class="entry-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="credit-card-dialog-title"
        (click)="$event.stopPropagation()">
        <header class="dialog-header">
          <h2 id="credit-card-dialog-title">{{ editingCreditCardId ? 'Edit Credit Card' : 'Add Credit Card' }}</h2>
          <button type="button" class="dialog-close" aria-label="Close dialog" (click)="closeCreditCardModal()">×</button>
        </header>
        <form #creditCardForm="ngForm" (ngSubmit)="saveCreditCard()">
          <div class="dialog-fields">
            <label class="form-field">
              <span>Card Name / Issuer</span>
              <input type="text" name="creditCardName" [(ngModel)]="creditCardFormValues.name" placeholder="e.g., HDFC Regalia" autocomplete="organization" maxlength="100" required>
            </label>
            <div class="account-form-row">
              <label class="form-field">
                <span>Statement Balance ($)</span>
                <input type="number" name="creditCardBalance" [(ngModel)]="creditCardFormValues.statementBalance" min="0" step="0.01" placeholder="0.00" required>
              </label>
              <label class="form-field">
                <span>Minimum Due ($)</span>
                <input type="number" name="creditCardMinimumDue" [(ngModel)]="creditCardFormValues.minimumDue" min="0" step="0.01" placeholder="0.00" required>
              </label>
            </div>
            <div class="account-form-row">
              <label class="form-field">
                <span>Due Date</span>
                <input type="date" name="creditCardDueDate" [(ngModel)]="creditCardFormValues.dueDate" required>
              </label>
              <label class="form-field">
                <span>Credit Limit ($)</span>
                <input type="number" name="creditCardLimit" [(ngModel)]="creditCardFormValues.creditLimit" min="0.01" step="0.01" placeholder="e.g., 8000.00" required>
              </label>
            </div>
          </div>
          <p class="household-bills-error" *ngIf="creditCardSaveError" role="alert">{{ creditCardSaveError }}</p>
          <footer class="dialog-footer">
            <button type="button" class="button button-cancel" (click)="closeCreditCardModal()">Cancel</button>
            <button type="submit" class="button button-save" [disabled]="creditCardForm.invalid || !canSaveCreditCard() || creditCardSaving">
              {{ creditCardSaving ? (editingCreditCardId ? 'Updating...' : 'Saving...') : (editingCreditCardId ? 'Update Credit Card' : 'Save Credit Card') }}
            </button>
          </footer>
        </form>
      </section>
    </div>

    <div class="modal-backdrop" *ngIf="showDebitTransactionModal" (click)="closeDebitTransactionModal()">
      <section
        class="entry-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="debit-transaction-dialog-title"
        (click)="$event.stopPropagation()">
        <header class="dialog-header">
          <h2 id="debit-transaction-dialog-title">{{ editingDebitTransactionId ? 'Edit Debit Expense' : 'Record Debit Expense' }}</h2>
          <button type="button" class="dialog-close" aria-label="Close dialog" (click)="closeDebitTransactionModal()">×</button>
        </header>
        <form #debitTransactionForm="ngForm" (ngSubmit)="saveDebitTransaction()">
          <div class="dialog-fields">
            <label class="form-field">
              <span>Date</span>
              <input type="date" name="debitTransactionDate" [(ngModel)]="debitTransactionFormValues.date" required>
            </label>
            <label class="form-field">
              <span>Bank Account</span>
              <select name="debitTransactionBank" [(ngModel)]="debitTransactionFormValues.accountId" required>
                <option value="" disabled>Select bank account</option>
                <option *ngFor="let account of bankAccounts" [value]="account.bankAccountId">{{ account.bankName }} •••• {{ account.lastFour }}</option>
              </select>
            </label>
            <label class="form-field">
              <span>Merchant / Description</span>
              <input type="text" name="debitTransactionMerchant" [(ngModel)]="debitTransactionFormValues.merchant" maxlength="150" placeholder="e.g., Whole Foods Market" autocomplete="off" required>
            </label>
            <div class="account-form-row">
              <label class="form-field">
                <span>Amount ($)</span>
                <input type="number" name="debitTransactionAmount" [(ngModel)]="debitTransactionFormValues.amount" min="0.01" step="0.01" placeholder="0.00" required>
              </label>
              <label class="form-field">
                <span>Type / Category</span>
                <input type="text" name="debitTransactionCategory" [(ngModel)]="debitTransactionFormValues.category" maxlength="50" placeholder="e.g., Groceries, Fuel" autocomplete="off" required>
              </label>
            </div>
          </div>
          <p class="household-bills-error" *ngIf="debitTransactionSaveError" role="alert">{{ debitTransactionSaveError }}</p>
          <footer class="dialog-footer">
            <button type="button" class="button button-cancel" (click)="closeDebitTransactionModal()">Cancel</button>
            <button type="submit" class="button button-save" [disabled]="debitTransactionForm.invalid || !canSaveDebitTransaction() || debitTransactionSaving">
              {{ debitTransactionSaving ? (editingDebitTransactionId ? 'Updating...' : 'Saving...') : (editingDebitTransactionId ? 'Update Expense' : 'Record Expense') }}
            </button>
          </footer>
        </form>
      </section>
    </div>

    <div class="modal-backdrop" *ngIf="showBankLoanModal" (click)="closeBankLoanModal()">
      <section
        class="entry-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bank-loan-dialog-title"
        (click)="$event.stopPropagation()">
        <header class="dialog-header">
          <h2 id="bank-loan-dialog-title">{{ editingBankLoanId ? 'Edit Bank Loan' : 'Add Bank Loan' }}</h2>
          <button type="button" class="dialog-close" aria-label="Close dialog" (click)="closeBankLoanModal()">×</button>
        </header>
        <form #bankLoanForm="ngForm" (ngSubmit)="saveBankLoan()">
          <div class="dialog-fields">
            <label class="form-field">
              <span>Lender / Bank</span>
              <input type="text" name="loanLender" [(ngModel)]="bankLoanFormValues.lender" placeholder="e.g., SBI Home Finance" autocomplete="organization" maxlength="150" required>
            </label>
            <label class="form-field">
              <span>Loan Type</span>
              <select name="loanType" [(ngModel)]="bankLoanFormValues.type" required>
                <option value="Home Loan">Home Loan</option>
                <option value="Personal Loan">Personal Loan</option>
                <option value="Vehicle Loan">Vehicle Loan</option>
                <option value="Other">Other</option>
              </select>
            </label>
            <div class="account-form-row">
              <label class="form-field">
                <span>Interest Rate (%)</span>
                <input type="number" name="loanInterestRate" [(ngModel)]="bankLoanFormValues.interestRate" min="0" max="999.99" step="0.01" placeholder="e.g., 8.4" required>
              </label>
              <label class="form-field">
                <span>Monthly EMI ($)</span>
                <input type="number" name="loanEmi" [(ngModel)]="bankLoanFormValues.monthlyEmi" min="0.01" max="9999999999999999.99" step="0.01" placeholder="0.00" required>
              </label>
            </div>
            <div class="account-form-row">
              <label class="form-field">
                <span>Principal Remaining ($)</span>
                <input type="number" name="loanPrincipal" [(ngModel)]="bankLoanFormValues.principalRemaining" min="0" max="9999999999999999.99" step="0.01" placeholder="0.00" required>
              </label>
              <label class="form-field">
                <span>Years Remaining</span>
                <input type="number" name="loanYearsRemaining" [(ngModel)]="bankLoanFormValues.yearsRemaining" min="0.01" max="9999.99" step="0.01" placeholder="e.g., 18" required>
              </label>
            </div>
          </div>
          <p class="household-bills-error" *ngIf="bankLoanSaveError" role="alert">{{ bankLoanSaveError }}</p>
          <footer class="dialog-footer">
            <button type="button" class="button button-cancel" (click)="closeBankLoanModal()">Cancel</button>
            <button type="submit" class="button button-save" [disabled]="bankLoanForm.invalid || !canSaveBankLoan() || bankLoanSaving">
              {{ bankLoanSaving ? (editingBankLoanId ? 'Updating...' : 'Saving...') : (editingBankLoanId ? 'Update Bank Loan' : 'Save Bank Loan') }}
            </button>
          </footer>
        </form>
      </section>
    </div>

    <div class="modal-backdrop" *ngIf="showAppLoanModal" (click)="closeAppLoanModal()">
      <section
        class="entry-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="app-loan-dialog-title"
        (click)="$event.stopPropagation()">
        <header class="dialog-header">
          <h2 id="app-loan-dialog-title">{{ editingAppLoanId ? 'Edit App Loan' : 'Add App Loan' }}</h2>
          <button type="button" class="dialog-close" aria-label="Close dialog" (click)="closeAppLoanModal()">×</button>
        </header>
        <form #appLoanForm="ngForm" (ngSubmit)="saveAppLoan()">
          <div class="dialog-fields">
            <label class="form-field">
              <span>Fintech App / Lender</span>
              <input type="text" name="appLoanName" [(ngModel)]="appLoanFormValues.appName" maxlength="100" placeholder="e.g., Slice PayLater" autocomplete="organization" required>
            </label>
            <label class="form-field">
              <span>Loan Type</span>
              <select name="appLoanType" [(ngModel)]="appLoanFormValues.type" required>
                <option value="App Loan">App Loan</option>
                <option value="PayLater">PayLater</option>
              </select>
            </label>
            <div class="account-form-row">
              <label class="form-field">
                <span>Outstanding Balance ($)</span>
                <input type="number" name="appLoanBalance" [(ngModel)]="appLoanFormValues.outstandingBalance" min="0" step="0.01" placeholder="0.00" required>
              </label>
              <label class="form-field">
                <span>Next EMI ($)</span>
                <input type="number" name="appLoanEmi" [(ngModel)]="appLoanFormValues.nextEmi" min="0" step="0.01" placeholder="0.00" required>
              </label>
            </div>
            <label class="form-field">
              <span>Due Date</span>
              <input type="date" name="appLoanDueDate" [(ngModel)]="appLoanFormValues.dueDate" required>
            </label>
          </div>
          <p class="household-bills-error" *ngIf="appLoanSaveError" role="alert">{{ appLoanSaveError }}</p>
          <footer class="dialog-footer">
            <button type="button" class="button button-cancel" (click)="closeAppLoanModal()">Cancel</button>
            <button type="submit" class="button button-save" [disabled]="appLoanForm.invalid || !canSaveAppLoan() || appLoanSaving">
              {{ appLoanSaving ? (editingAppLoanId ? 'Updating...' : 'Saving...') : (editingAppLoanId ? 'Update App Loan' : 'Save App Loan') }}
            </button>
          </footer>
        </form>
      </section>
    </div>

    <div class="modal-backdrop" *ngIf="showBorrowingModal" (click)="closeBorrowingModal()">
      <section
        class="entry-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="borrowing-dialog-title"
        (click)="$event.stopPropagation()">
        <header class="dialog-header">
          <h2 id="borrowing-dialog-title">Record Borrowing</h2>
          <button type="button" class="dialog-close" aria-label="Close dialog" (click)="closeBorrowingModal()">×</button>
        </header>
        <form #borrowingForm="ngForm" (ngSubmit)="saveBorrowing()">
          <div class="dialog-fields">
            <label class="form-field">
              <span>Lender Name</span>
              <input type="text" name="borrowingLender" [(ngModel)]="borrowingFormValues.lender" placeholder="e.g., Uncle Robert" autocomplete="name" required>
            </label>
            <label class="form-field">
              <span>Relationship / Notes</span>
              <input type="text" name="borrowingNotes" [(ngModel)]="borrowingFormValues.notes" placeholder="e.g., Emergency car repair loan" autocomplete="off" required>
            </label>
            <div class="account-form-row">
              <label class="form-field">
                <span>Initial Amount ($)</span>
                <input type="number" name="borrowingAmount" [(ngModel)]="borrowingFormValues.initialAmount" min="0.01" step="0.01" placeholder="0.00" required>
              </label>
              <label class="form-field">
                <span>Target Repayment Date</span>
                <input type="date" name="borrowingTargetDate" [(ngModel)]="borrowingFormValues.targetRepaymentDate" required>
              </label>
            </div>
          </div>
          <footer class="dialog-footer">
            <button type="button" class="button button-cancel" (click)="closeBorrowingModal()">Cancel</button>
            <p class="household-bills-error" *ngIf="informalBorrowingSaveError" role="alert">{{ informalBorrowingSaveError }}</p>
            <button type="submit" class="button button-save" [disabled]="borrowingForm.invalid || !canSaveBorrowing() || informalBorrowingSaving">
              {{ informalBorrowingSaving ? 'Saving...' : 'Record Borrowing' }}
            </button>
          </footer>
        </form>
      </section>
    </div>

    <div class="modal-backdrop" *ngIf="selectedPaybackBorrowing" (click)="closePaybackModal()">
      <section
        class="entry-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="payback-dialog-title"
        (click)="$event.stopPropagation()">
        <header class="dialog-header">
          <h2 id="payback-dialog-title">Record Payback</h2>
          <button type="button" class="dialog-close" aria-label="Close dialog" (click)="closePaybackModal()">×</button>
        </header>
        <form #paybackForm="ngForm" (ngSubmit)="savePayback()">
          <div class="dialog-fields">
            <p class="payback-balance">Remaining balance: <strong>{{ selectedPaybackBorrowing.remainingBalance | currency:'USD':'symbol':'1.2-2' }}</strong></p>
            <label class="form-field">
              <span>Payback Amount ($)</span>
              <input type="number" name="paybackAmount" [(ngModel)]="paybackAmount" min="0.01" [max]="selectedPaybackBorrowing.remainingBalance" step="0.01" placeholder="0.00" required>
            </label>
          </div>
          <p class="household-bills-error" *ngIf="paybackSaveError" role="alert">{{ paybackSaveError }}</p>
          <footer class="dialog-footer">
            <button type="button" class="button button-cancel" (click)="closePaybackModal()">Cancel</button>
            <button type="submit" class="button button-save" [disabled]="paybackForm.invalid || !canSavePayback() || paybackSaving">
              {{ paybackSaving ? 'Saving...' : 'Record Payback' }}
            </button>
          </footer>
        </form>
      </section>
    </div>

    <div class="modal-backdrop" *ngIf="showIncomeSourceModal" (click)="closeIncomeSourceModal()">
      <section
        class="entry-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="income-source-dialog-title"
        (click)="$event.stopPropagation()">
        <header class="dialog-header">
          <h2 id="income-source-dialog-title">Add Income Source</h2>
          <button type="button" class="dialog-close" aria-label="Close dialog" (click)="closeIncomeSourceModal()">×</button>
        </header>
        <form #incomeSourceForm="ngForm" (ngSubmit)="saveIncomeSource()">
          <div class="dialog-fields">
            <label class="form-field">
              <span>Income Source</span>
              <input type="text" name="incomeSourceName" [(ngModel)]="incomeSourceFormValues.name" maxlength="100" placeholder="e.g., Freelance Design" autocomplete="off" required>
            </label>
            <div class="account-form-row">
              <label class="form-field">
                <span>Category</span>
                <select name="incomeSourceCategory" [(ngModel)]="incomeSourceFormValues.category" required>
                  <option value="Side Hustle">Side Hustle</option>
                  <option value="Investments">Investments</option>
                  <option value="Rental">Rental</option>
                  <option value="Other">Other</option>
                </select>
              </label>
              <label class="form-field">
                <span>Frequency</span>
                <select name="incomeSourceFrequency" [(ngModel)]="incomeSourceFormValues.frequency" required>
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Annually">Annually</option>
                  <option value="One-time">One-time</option>
                </select>
              </label>
            </div>
            <label class="form-field">
              <span>Amount ($)</span>
              <input type="number" name="incomeSourceAmount" [(ngModel)]="incomeSourceFormValues.amount" min="0.01" step="0.01" placeholder="0.00" required>
            </label>
          </div>
          <p class="household-bills-error" *ngIf="incomeSourceSaveError" role="alert">{{ incomeSourceSaveError }}</p>
          <footer class="dialog-footer">
            <button type="button" class="button button-cancel" (click)="closeIncomeSourceModal()">Cancel</button>
            <button type="submit" class="button button-save" [disabled]="incomeSourceForm.invalid || !canSaveIncomeSource() || incomeSourceSaving">
              {{ incomeSourceSaving ? 'Saving...' : 'Save Income Source' }}
            </button>
          </footer>
        </form>
      </section>
    </div>

    <div class="modal-backdrop" *ngIf="showHouseholdBillModal" (click)="closeHouseholdBillModal()">
      <section
        class="entry-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="household-bill-dialog-title"
        (click)="$event.stopPropagation()">
        <header class="dialog-header">
          <h2 id="household-bill-dialog-title">{{ editingHouseholdBillId ? 'Edit Household Bill' : 'Add Household Bill' }}</h2>
          <button type="button" class="dialog-close" aria-label="Close dialog" (click)="closeHouseholdBillModal()">×</button>
        </header>
        <form #householdBillForm="ngForm" (ngSubmit)="saveHouseholdBill()">
          <div class="dialog-fields">
            <label class="form-field">
              <span>Bill Type</span>
              <input
                type="text"
                name="billCategory"
                [(ngModel)]="householdBillFormValues.category"
                placeholder="e.g., Electricity, Gas, Water Tax"
                autocomplete="off"
                required>
            </label>
            <label class="form-field">
              <span>Provider / Description</span>
              <input
                type="text"
                name="billProvider"
                [(ngModel)]="householdBillFormValues.provider"
                placeholder="e.g., City Power Corp"
                autocomplete="organization"
                required>
            </label>
            <div class="account-form-row">
              <label class="form-field">
                <span>Due Date</span>
                <input type="date" name="billDueDate" [(ngModel)]="householdBillFormValues.dueDate" required>
              </label>
              <label class="form-field">
                <span>Amount ($)</span>
                <input
                  type="number"
                  name="billAmount"
                  [(ngModel)]="householdBillFormValues.amount"
                  min="0.01"
                  step="0.01"
                  placeholder="0.00"
                  required>
              </label>
            </div>
          </div>
          <footer class="dialog-footer">
            <button type="button" class="button button-cancel" (click)="closeHouseholdBillModal()">Cancel</button>
            <button type="submit" class="button button-save" [disabled]="householdBillForm.invalid || !canSaveHouseholdBill() || householdBillSaving">{{ householdBillSaving ? 'Saving…' : editingHouseholdBillId ? 'Save Changes' : 'Save Bill' }}</button>
          </footer>
        </form>
      </section>
    </div>

    <div class="modal-backdrop" *ngIf="showMedicalExpenseModal" (click)="closeMedicalExpenseModal()">
      <section
        class="entry-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="medical-expense-dialog-title"
        (click)="$event.stopPropagation()">
        <header class="dialog-header">
          <h2 id="medical-expense-dialog-title">{{ editingMedicalExpenseId ? 'Edit Medical Expense' : 'Log Medical Expense' }}</h2>
          <button type="button" class="dialog-close" aria-label="Close dialog" (click)="closeMedicalExpenseModal()">×</button>
        </header>
        <form #medicalExpenseForm="ngForm" (ngSubmit)="saveMedicalExpense()">
          <div class="dialog-fields">
            <label class="form-field">
              <span>Service / Hospital</span>
              <input type="text" name="medicalServiceName" [(ngModel)]="medicalExpenseFormValues.serviceName" maxlength="100" placeholder="e.g., City General Hospital" autocomplete="organization" required>
            </label>
            <label class="form-field">
              <span>Patient / Detail</span>
              <input type="text" name="medicalPatientDetail" [(ngModel)]="medicalExpenseFormValues.patientDetail" maxlength="255" placeholder="e.g., Consultation, prescription" autocomplete="off" required>
            </label>
            <div class="account-form-row">
              <label class="form-field">
                <span>Bill Date</span>
                <input type="date" name="medicalBillDate" [(ngModel)]="medicalExpenseFormValues.billDate" required>
              </label>
              <label class="form-field">
                <span>Status</span>
                <select name="medicalStatus" [(ngModel)]="medicalExpenseFormValues.status" required>
                  <option value="Pending">Pending</option>
                  <option value="Paid">Paid</option>
                </select>
              </label>
            </div>
            <div class="account-form-row">
              <label class="form-field">
                <span>Insurance Covered ($)</span>
                <input type="number" name="medicalInsuranceCovered" [(ngModel)]="medicalExpenseFormValues.insuranceCovered" min="0" step="0.01" placeholder="0.00" required>
              </label>
              <label class="form-field">
                <span>Out-of-Pocket Due ($)</span>
                <input type="number" name="medicalOutOfPocketDue" [(ngModel)]="medicalExpenseFormValues.outOfPocketDue" min="0" step="0.01" placeholder="0.00" required>
              </label>
            </div>
          </div>
          <p class="household-bills-error" *ngIf="medicalExpenseSaveError" role="alert">{{ medicalExpenseSaveError }}</p>
          <footer class="dialog-footer">
            <button type="button" class="button button-cancel" (click)="closeMedicalExpenseModal()">Cancel</button>
            <button type="submit" class="button button-save" [disabled]="medicalExpenseForm.invalid || !canSaveMedicalExpense() || medicalExpenseSaving">
              {{ medicalExpenseSaving ? 'Saving…' : editingMedicalExpenseId ? 'Save Changes' : 'Log Expense' }}
            </button>
          </footer>
        </form>
      </section>
    </div>

    <div class="modal-backdrop" *ngIf="selectedMedicalClaim" (click)="closeMedicalClaim()">
      <section
        class="entry-dialog medical-claim-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="medical-claim-dialog-title"
        (click)="$event.stopPropagation()">
        <header class="dialog-header">
          <h2 id="medical-claim-dialog-title">Medical Expense Claim</h2>
          <button type="button" class="dialog-close" aria-label="Close dialog" (click)="closeMedicalClaim()">×</button>
        </header>
        <dl class="medical-claim-details">
          <div><dt>Service / Hospital</dt><dd>{{ selectedMedicalClaim.serviceName }}</dd></div>
          <div><dt>Patient / Detail</dt><dd>{{ selectedMedicalClaim.patientDetail }}</dd></div>
          <div><dt>Bill Date</dt><dd>{{ selectedMedicalClaim.billDate }}</dd></div>
          <div><dt>Insurance Covered</dt><dd>{{ selectedMedicalClaim.insuranceCovered | currency:'USD':'symbol':'1.2-2' }}</dd></div>
          <div><dt>Out-of-Pocket Due</dt><dd>{{ selectedMedicalClaim.outOfPocketDue | currency:'USD':'symbol':'1.2-2' }}</dd></div>
          <div><dt>Status</dt><dd>{{ selectedMedicalClaim.status }}</dd></div>
        </dl>
        <p
          class="medical-expense-operation-feedback"
          *ngIf="medicalExpenseOperationMessage"
          [class.success]="medicalExpenseOperationSucceeded"
          [class.failure]="!medicalExpenseOperationSucceeded"
          [attr.role]="medicalExpenseOperationSucceeded ? 'status' : 'alert'"
          aria-live="polite">
          {{ medicalExpenseOperationMessage }}
        </p>
        <p class="household-bills-error" *ngIf="medicalExpensesError" role="alert">{{ medicalExpensesError }}</p>
        <footer class="dialog-footer">
          <button type="button" class="button button-save" *ngIf="selectedMedicalClaim.status !== 'Paid'" (click)="markMedicalExpensePaid(selectedMedicalClaim)">Mark Paid</button>
          <button type="button" class="button button-cancel" (click)="closeMedicalClaim()">Close</button>
        </footer>
      </section>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-height: 100vh;
      color: #e8edf8;
      background: #070d1c;
      font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 13px;
    }

    * { box-sizing: border-box; }
    button, a { font: inherit; }
    button { cursor: pointer; }

    .app-shell { display: flex; min-height: 100vh; background: #070d1c; }
    .sidebar {
      width: 164px;
      min-width: 164px;
      display: flex;
      flex-direction: column;
      background: #0c1527;
      border-right: 1px solid #1b2941;
    }
    .brand {
      display: flex;
      align-items: center;
      gap: 12px;
      min-height: 39px;
      padding: 0 9px;
      color: inherit;
      text-decoration: none;
      border-bottom: 1px solid #1a263b;
    }
    .brand-mark {
      display: grid;
      place-items: center;
      width: 27px;
      height: 27px;
      border-radius: 8px;
      background: #4667ff;
      box-shadow: 0 5px 16px #4162fa30;
    }
    .brand-mark svg { width: 19px; fill: none; stroke: #fff; stroke-linecap: round; stroke-linejoin: round; stroke-width: 1.7; }
    .brand-copy, .profile-copy { display: flex; min-width: 0; flex-direction: column; gap: 3px; }
    .brand-copy strong { font-size: 12px; letter-spacing: -.2px; }
    .brand-copy small, .profile-copy small { color: #8190a8; font-size: 8px; }
    .side-nav { flex: 1; padding: 10px 10px 14px; overflow-y: auto; }
    .nav-group { margin-bottom: 9px; }
    .nav-heading {
      display: block;
      margin: 0 0 6px 2px;
      color: #7e8ba2;
      font-size: 9px;
      font-weight: 750;
      letter-spacing: .55px;
      text-transform: uppercase;
    }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 10px;
      min-height: 28px;
      margin: 2px 0;
      padding: 0 9px;
      border: 1px solid transparent;
      border-radius: 6px;
      color: #a4b0c4;
      font-size: 9px;
      font-weight: 550;
      text-decoration: none;
      transition: background .15s ease, color .15s ease;
    }
    .nav-link:hover { background: #15213a; color: #ecf2ff; }
    .nav-link.selected { border-color: #24427b; background: #122347; color: #66a5ff; }
    .nav-icon { display: inline-grid; width: 14px; place-items: center; color: #8797ae; font-size: 13px; font-weight: 700; }
    .selected .nav-icon, .ai-link, .ai-link .nav-icon { color: #70aaff; }
    .profile { display: flex; align-items: center; gap: 7px; min-height: 52px; padding: 8px 9px; border-top: 1px solid #1b2941; }
    .avatar { display: grid; width: 25px; height: 25px; flex: 0 0 25px; place-items: center; border-radius: 50%; background: #34445e; color: #e7eefb; font-size: 9px; font-weight: 700; }
    .profile-copy { flex: 1; }
    .profile-copy strong { color: #d7dfed; font-size: 9px; }
    .profile-add { width: 18px; height: 18px; border: 0; border-radius: 50%; background: #3a8bfa; color: white; font-size: 14px; line-height: 1; }

    .main-content { min-width: 0; flex: 1; }
    .topbar {
      display: flex;
      min-height: 39px;
      align-items: center;
      justify-content: space-between;
      gap: 18px;
      padding: 5px 16px;
      border-bottom: 1px solid #19243a;
      background: #0a1121;
    }
    .topbar h1 { margin: 0 0 1px; color: #f0f4fc; font-size: 15px; font-weight: 720; letter-spacing: -.45px; }
    .topbar p { margin: 0; color: #8491a8; font-size: 8px; }
    .top-actions { display: flex; align-items: center; gap: 9px; }
    .button { display: inline-flex; min-height: 25px; align-items: center; justify-content: center; gap: 7px; padding: 0 10px; border: 1px solid transparent; border-radius: 6px; color: #f7f9ff; font-size: 9px; font-weight: 700; white-space: nowrap; }
    .button-primary { background: #2f67ec; box-shadow: 0 4px 12px #2f67ec30; }
    .button-primary:hover { background: #3e78ff; }
    .button-ai { border-color: #36447c; background: #171d3a; color: #b6c4ff; }
    .button-ai:hover { background: #202a53; }

    .bank-accounts-page, .credit-score-page, .household-bills-page { min-height: calc(100vh - 39px); padding: 55px 32px 32px; background: #070d1c; }
    .accounts-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin-bottom: 23px; }
    .accounts-heading h2 { margin: 0; color: #f0f3fb; font-size: 18px; font-weight: 750; letter-spacing: -.3px; }
    .add-account-button { min-height: 29px; font-size: 10px; }
    .account-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; }
    .account-card { min-width: 0; min-height: 192px; padding: 20px; border: 1px solid #23304a; border-radius: 12px; background: #10192b; }
    .account-card-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px; }
    .account-type { overflow: hidden; max-width: calc(100% - 34px); padding: 5px 10px; border: 1px solid #1d3d73; border-radius: 20px; background: #11213d; color: #66a5ff; font-size: 10px; text-overflow: ellipsis; white-space: nowrap; }
    .account-bank-icon { color: #52657f; font-size: 18px; }
    .account-card h3 { overflow: hidden; margin: 0 0 4px; color: #f2f5fb; font-size: 14px; font-weight: 720; text-overflow: ellipsis; white-space: nowrap; }
    .account-number { margin: 0; color: #96a4ba; font-size: 10px; letter-spacing: .3px; }
    .account-balance { display: flex; align-items: flex-end; justify-content: space-between; gap: 10px; margin-top: 16px; padding-top: 13px; border-top: 1px solid #243149; }
    .account-balance > div { display: grid; gap: 5px; }
    .balance-label { color: #91a0b7; font-size: 9px; letter-spacing: .35px; text-transform: uppercase; }
    .account-balance strong { color: #19d49b; font-size: 19px; font-weight: 780; letter-spacing: -.25px; }
    .account-balance small { overflow: hidden; max-width: 48%; padding-bottom: 3px; color: #94a3ba; font-size: 8px; text-overflow: ellipsis; white-space: nowrap; }
    .empty-accounts { margin: 28px 0; color: #9aa8be; text-align: center; }
    .household-bills-heading { display: flex; align-items: center; justify-content: space-between; gap: 16px; margin: 0 0 23px; padding: 0 1px; }
    .household-bills-heading h2 { margin: 0; color: #f0f3fb; font-size: 18px; font-weight: 750; letter-spacing: -.3px; }
    .add-household-bill-button { min-height: 29px; font-size: 10px; }
    .bill-table-wrap { overflow-x: auto; border: 1px solid #26334b; border-radius: 12px; background: #10192b; }
    .bill-table { width: 100%; border-collapse: collapse; color: #dce5f4; font-size: 12px; text-align: left; }
    .bill-table thead { background: #192437; }
    .bill-table thead th { height: 48px; padding: 0 16px; color: #9fb0c9; font-size: 10px; font-weight: 700; letter-spacing: .3px; text-transform: uppercase; white-space: nowrap; }
    .bill-table tbody th, .bill-table tbody td { height: 57px; padding: 0 16px; border-top: 1px solid #202d43; white-space: nowrap; }
    .bill-table tbody th { color: #e8edf8; font-weight: 650; }
    .bill-table tbody td { color: #a7c3e9; }
    .bill-table tbody .bill-amount { color: #f3f6fd; font-weight: 750; }
    .bill-action-heading, .bill-action-cell { text-align: right; }
    .household-bill-actions { display: flex; justify-content: flex-end; }
    .household-bill-action-button { display: inline-grid; width: 26px; height: 26px; place-items: center; padding: 0; border: 1px solid #34445e; border-radius: 6px; background: #152137; color: #b7c8e1; }
    .household-bill-action-delete { color: #ff9a9a; }
    .household-bill-action-button:disabled { opacity: .55; }
    .bill-status { display: inline-flex; min-height: 25px; align-items: center; padding: 0 11px; border: 1px solid #624b1e; border-radius: 20px; background: #2b261b; color: #ffb526; font-size: 10px; }
    .bill-status.paid { border-color: #075c4b; background: #102b2d; color: #18d89a; }
    .mark-paid-button { min-width: 73px; min-height: 26px; padding: 0 10px; border: 0; border-radius: 5px; background: #079b75; color: #f4fffc; font-size: 10px; font-weight: 700; }
    .mark-paid-button:hover { background: #08b187; }
    .empty-bills { height: 80px !important; color: #9aa8be !important; text-align: center; }
    .household-bills-error { margin: 12px 0 0; color: #ffc055; font-size: 11px; }
    .credit-score-page { display: grid; grid-template-columns: minmax(270px, .7fr) minmax(0, 1.5fr); align-content: start; gap: 24px; padding: 56px 32px 32px; }
    .credit-health-card, .score-factors-card { min-width: 0; min-height: 260px; padding: 27px 24px 22px; border: 1px solid #23304a; border-radius: 12px; background: #10192b; }
    .credit-health-card { display: flex; flex-direction: column; align-items: center; text-align: center; }
    .credit-health-card h2, .score-factors-card h2 { margin: 0; color: #f0f3fb; font-size: 15px; font-weight: 750; }
    .score-gauge { position: relative; width: min(220px, 100%); height: 115px; margin: 8px auto 0; }
    .score-gauge svg { display: block; width: 100%; height: 100%; overflow: visible; }
    .gauge-track, .gauge-value { fill: none; stroke-width: 16; }
    .gauge-track { stroke: #25334a; }
    .gauge-value { stroke: #10bd87; stroke-linecap: butt; transition: stroke-dasharray .5s ease; }
    .gauge-score { position: absolute; inset: auto 0 0; display: grid; justify-items: center; gap: 1px; }
    .gauge-score strong { color: #f5f7fc; font-size: 31px; font-weight: 800; letter-spacing: -.8px; line-height: 1; }
    .gauge-score span { color: #a6b1c5; font-size: 10px; }
    .score-status { margin-top: 9px; padding: 5px 13px; border: 1px solid #075c4b; border-radius: 20px; background: #0c2b2c; color: #20e1a4; font-size: 10px; font-weight: 650; }
    .score-sync { margin: 17px 0 0; color: #9aa8be; font-size: 10px; }
    .credit-score-error { margin: 8px 0 0; color: #f4b740; font-size: 9px; }
    .score-factors-card h2 { margin-bottom: 20px; }
    .factor-list { display: grid; gap: 16px; }
    .factor-row { display: grid; gap: 6px; }
    .factor-copy { display: flex; align-items: center; justify-content: space-between; gap: 12px; color: #d3dced; font-size: 10px; }
    .factor-copy small { color: #a4b0c4; font-size: inherit; }
    .factor-copy strong { font-size: 10px; font-weight: 700; text-align: right; white-space: nowrap; }
    .factor-copy strong.green { color: #18d89a; }
    .factor-copy strong.amber { color: #ffba26; }
    .factor-copy strong.blue { color: #62a0ff; }
    .factor-track { height: 8px; overflow: hidden; border-radius: 20px; background: #253145; }
    .factor-track span { display: block; height: 100%; transition: width .4s ease; }
    .factor-track span.green { background: #10bd87; }
    .factor-track span.amber { background: #ffa90b; }
    .factor-track span.blue { background: #4386f5; }

    .modal-backdrop {
      position: fixed;
      z-index: 20;
      inset: 0;
      display: grid;
      place-items: center;
      padding: 18px;
      overflow-y: auto;
      background: rgb(3 8 22 / 76%);
      backdrop-filter: blur(5px);
    }
    .entry-dialog {
      width: min(448px, 100%);
      max-height: calc(100dvh - 36px);
      overflow-y: auto;
      overscroll-behavior: contain;
      border: 1px solid #26334b;
      border-radius: 16px;
      background: #10192b;
      box-shadow: 0 24px 80px rgb(0 0 0 / 45%);
      animation: dialog-enter .16s ease-out;
    }
    @keyframes dialog-enter {
      from { opacity: 0; transform: translateY(7px) scale(.99); }
      to { opacity: 1; transform: translateY(0) scale(1); }
    }
    .dialog-header {
      display: flex;
      min-height: 69px;
      align-items: center;
      justify-content: space-between;
      padding: 0 20px;
      border-bottom: 1px solid #253149;
    }
    .dialog-header h2 { margin: 0; color: #f0f3fb; font-size: 15px; font-weight: 750; }
    .dialog-close {
      display: grid;
      width: 30px;
      height: 30px;
      place-items: center;
      padding: 0;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: #9aa8be;
      font-size: 23px;
      line-height: 1;
    }
    .dialog-close:hover { background: #1b2840; color: #fff; }
    .dialog-fields { display: grid; gap: 16px; padding: 20px; }
    .account-form-row { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
    .form-field { display: grid; gap: 6px; color: #a7b3c8; }
    .form-field > span { font-size: 10px; font-weight: 700; text-transform: uppercase; }
    .form-field input {
      width: 100%;
      height: 39px;
      padding: 0 12px;
      border: 1px solid #344258;
      border-radius: 7px;
      outline: none;
      background: #1e293b;
      color: #e8edf8;
      font: inherit;
      font-size: 12px;
      color-scheme: dark;
      transition: border-color .15s ease, box-shadow .15s ease;
    }
    .form-field select {
      width: 100%;
      height: 39px;
      padding: 0 12px;
      border: 1px solid #344258;
      border-radius: 7px;
      outline: none;
      background: #1e293b;
      color: #e8edf8;
      font: inherit;
      font-size: 12px;
      color-scheme: dark;
    }
    .form-field select:focus { border-color: #4a7fff; box-shadow: 0 0 0 3px rgb(74 127 255 / 16%); }
    .form-field input::placeholder { color: #99a4b7; opacity: 1; }
    .form-field input:focus { border-color: #4a7fff; box-shadow: 0 0 0 3px rgb(74 127 255 / 16%); }
    .dialog-footer {
      display: flex;
      justify-content: flex-end;
      gap: 10px;
      margin: 0 20px;
      padding: 16px 0 20px;
      border-top: 1px solid #253149;
    }
    .dialog-footer .button { min-height: 33px; padding: 0 15px; font-size: 10px; }
    .button-cancel { background: #202c40; color: #dce5f4; }
    .button-cancel:hover { background: #29374e; }
    .button-save { background: #2f67ec; }
    .button-save:hover:not(:disabled) { background: #3e78ff; }
    .button-save:disabled { cursor: not-allowed; opacity: .55; }
    @media (prefers-reduced-motion: reduce) {
      .entry-dialog { animation: none; }
    }

    .dashboard-content { display: flex; flex-direction: column; gap: 16px; max-width: 1700px; margin: 0 auto; padding: 20px 20px 12px; }
    .summary-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
    .summary-card, .panel { border: 1px solid #23304a; border-radius: 9px; background: #10192b; }
    .summary-card { min-height: 93px; padding: 12px 14px 10px; }
    .summary-heading { display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px; color: #a8b4c9; font-size: 9px; font-weight: 700; letter-spacing: .45px; text-transform: uppercase; }
    .summary-icon { display: grid; width: 22px; height: 22px; place-items: center; border-radius: 6px; font-size: 12px; font-weight: 800; }
    .summary-icon.green { background: #073d36; color: #10d9a1; }
    .summary-icon.red { background: #401b2b; color: #ff6b85; }
    .summary-icon.amber { background: #3e2d13; color: #ffb31a; }
    .summary-icon.blue { background: #142e54; color: #55a2ff; }
    .summary-value { display: block; color: #f3f6fd; font-size: 18px; font-weight: 750; letter-spacing: -.3px; line-height: 1.25; }
    .summary-value.negative { color: #ff5f79; }
    .summary-value.score { color: #18d89a; }
    .summary-value.score small { color: #95a4ba; font-size: 9px; font-weight: 500; letter-spacing: 0; }
    .summary-note { display: block; margin-top: 5px; color: #8d9ab1; font-size: 9px; }
    .summary-note.positive { color: #00d69c; }
    .summary-note.warning { color: #ffb625; }

    .charts-grid { display: grid; grid-template-columns: minmax(0, 1.95fr) minmax(280px, 1fr); gap: 14px; }
    .panel { min-width: 0; padding: 12px 13px; }
    .cashflow-panel, .liabilities-panel { min-height: 223px; }
    .panel-heading { display: flex; align-items: center; justify-content: space-between; gap: 12px; }
    .panel-heading h2, .insight-title h2 { margin: 0; color: #e6ecf8; font-size: 11px; font-weight: 720; }
    .panel-heading > span { color: #8d9ab0; font-size: 9px; }
    .chart-legend { display: flex; justify-content: center; gap: 14px; margin: 13px 0 3px; color: #9aa8be; font-size: 9px; }
    .chart-legend span { display: flex; align-items: center; gap: 5px; }
    .legend-line { display: inline-block; width: 22px; height: 9px; border: 2px solid; }
    .legend-line.income { border-color: #00b989; }
    .legend-line.expenses { border-color: #ff504d; }
    .line-chart { position: relative; height: 145px; margin: 0 4px 0 30px; padding-bottom: 16px; }
    .line-chart svg { display: block; width: 100%; height: 128px; overflow: visible; }
    .grid-line { fill: none; stroke: #1d2a41; stroke-width: 1; vector-effect: non-scaling-stroke; }
    .grid-line.vertical { stroke: #1a263c; }
    .income-area { fill: url(#incomeFill); }
    .income-path, .expense-path { fill: none; stroke-width: 2.2; vector-effect: non-scaling-stroke; }
    .income-path { stroke: #00ba88; }
    .expense-path { stroke: #ff514f; }
    .chart-points circle { stroke-width: 1; vector-effect: non-scaling-stroke; }
    .income-points circle { fill: #00bd8d; stroke: #063e34; }
    .expense-points circle { fill: #ff5551; stroke: #522927; }
    .y-labels { position: absolute; top: -1px; bottom: 20px; left: -30px; display: flex; flex-direction: column; justify-content: space-between; color: #74829a; font-size: 8px; }
    .x-labels { display: flex; justify-content: space-between; margin-top: 0; color: #74829a; font-size: 8px; }
    .donut-wrap { display: grid; height: 151px; place-items: center; }
    .donut-chart { display: grid; width: 138px; height: 138px; place-items: center; border-radius: 50%; background: conic-gradient(#6563f1 0% 78%, #3189ef 78% 90%, #ff9815 90% 95%, #ec4899 95% 98%, #9a5cf5 98% 100%); transform: rotate(-5deg); }
    .donut-hole { width: 76px; height: 76px; border: 1px solid #293550; border-radius: 50%; background: #10192b; }
    .donut-legend { display: flex; flex-wrap: wrap; justify-content: center; gap: 5px 9px; color: #a3aec2; font-size: 8px; }
    .donut-legend span { display: inline-flex; align-items: center; gap: 4px; white-space: nowrap; }
    .donut-legend i { width: 10px; height: 7px; display: inline-block; }
    .donut-legend .home-loan { background: #6563f1; }
    .donut-legend .personal-loan { background: #3189ef; }
    .donut-legend .credit-cards { background: #ff9815; }
    .donut-legend .fintech-apps { background: #ec4899; }
    .donut-legend .informal { background: #9a5cf5; }

    .bottom-grid { display: grid; grid-template-columns: minmax(0, 1.02fr) minmax(0, 1fr); gap: 14px; }
    .dues-panel, .insight-panel { min-height: 203px; }
    .text-button { padding: 3px 0; border: 0; background: transparent; color: #75a8ff; font-size: 9px; }
    .text-button:hover { color: #a9c8ff; }
    .due-list { display: grid; gap: 7px; margin-top: 12px; }
    .due-row { display: flex; min-height: 39px; align-items: center; gap: 9px; padding: 5px 8px; border: 1px solid #202d43; border-radius: 6px; background: #172236; }
    .due-icon { display: grid; width: 22px; height: 22px; flex: 0 0 22px; place-items: center; border-radius: 5px; background: #322916; color: #ffb21a; font-size: 10px; }
    .due-description, .due-amount { display: flex; min-width: 0; flex-direction: column; gap: 3px; }
    .due-description { flex: 1; }
    .due-description strong, .due-amount strong { overflow: hidden; color: #e2e8f4; font-size: 9px; font-weight: 650; text-overflow: ellipsis; white-space: nowrap; }
    .due-description small { color: #8290a7; font-size: 8px; }
    .due-amount { align-items: flex-end; }
    .due-amount small { color: #ffb21a; font-size: 8px; }
    .insight-panel { position: relative; display: flex; flex-direction: column; overflow: hidden; border-color: #3a3b85; background: linear-gradient(125deg, #121a37 0%, #11132b 100%); }
    .insight-title { display: flex; align-items: center; gap: 7px; color: #8b83ff; }
    .insight-title h2 { color: #8988ff; font-size: 9px; letter-spacing: .55px; text-transform: uppercase; }
    .sparkle { font-size: 15px; }
    .insight-panel h3 { margin: 12px 0 5px; color: #f1f3ff; font-size: 12px; }
    .insight-panel p { max-width: 650px; margin: 0; color: #d4dcf0; font-size: 10px; line-height: 1.65; }
    .insight-panel p strong { color: #53a2ff; font-weight: 750; }
    .insight-panel p strong.savings { color: #ffbd36; }
    .insight-actions { display: flex; align-items: center; gap: 10px; margin-top: auto; padding-top: 12px; }
    .button-consult { min-height: 29px; padding: 0 11px; background: #5145e8; font-size: 9px; }
    .button-consult:hover { background: #6358fa; }
    .dismiss-button { color: #a5b0d1; }

    @media (min-width: 1500px) {
      .dashboard-content { padding-top: 26px; gap: 18px; }
      .summary-card { min-height: 120px; padding: 17px; }
      .cashflow-panel, .liabilities-panel { min-height: 290px; }
      .line-chart { height: 191px; }
      .line-chart svg { height: 167px; }
      .donut-wrap { height: 205px; }
      .donut-chart { width: 155px; height: 155px; }
      .donut-hole { width: 84px; height: 84px; }
      .dues-panel, .insight-panel { min-height: 235px; }
    }
    @media (max-width: 1000px) {
      .sidebar { width: 180px; min-width: 180px; }
      .dashboard-content { padding-right: 15px; padding-left: 15px; }
      .topbar { padding-right: 15px; padding-left: 15px; }
      .charts-grid { grid-template-columns: minmax(0, 1.55fr) minmax(250px, 1fr); }
      .summary-card { padding-right: 11px; padding-left: 11px; }
      .summary-value { font-size: 16px; }
      .account-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 14px; }
      .credit-score-page { grid-template-columns: minmax(245px, .8fr) minmax(0, 1.2fr); gap: 14px; padding-right: 15px; padding-left: 15px; }
      .credit-health-card, .score-factors-card { padding-right: 17px; padding-left: 17px; }
      .household-bills-page { padding-right: 15px; padding-left: 15px; }
    }
    @media (max-width: 760px) {
      .sidebar { width: 62px; min-width: 62px; }
      .brand { justify-content: center; padding: 0; }
      .brand-copy, .nav-heading, .profile-copy, .profile-add { display: none; }
      .side-nav { padding: 13px 8px; }
      .nav-group { margin-bottom: 12px; }
      .nav-link { justify-content: center; padding: 0; font-size: 0; }
      .nav-link .nav-icon { font-size: 16px; }
      .profile { justify-content: center; padding: 8px 0; }
      .topbar { align-items: flex-start; flex-direction: column; padding-top: 14px; padding-bottom: 12px; }
      .top-actions { width: 100%; }
      .button { min-height: 32px; }
      .summary-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
      .charts-grid, .bottom-grid { grid-template-columns: 1fr; }
      .cashflow-panel, .liabilities-panel { min-height: 250px; }
      .line-chart { height: 158px; }
      .line-chart svg { height: 134px; }
      .donut-wrap { height: 175px; }
      .dues-panel, .insight-panel { min-height: 210px; }
      .bank-accounts-page { min-height: calc(100vh - 105px); padding: 25px 15px; }
      .accounts-heading h2 { font-size: 15px; }
      .account-grid { grid-template-columns: 1fr; gap: 10px; }
      .account-card { min-height: 170px; padding: 17px; }
      .credit-score-page { grid-template-columns: 1fr; gap: 12px; padding: 20px 15px; }
      .credit-health-card { min-height: 260px; }
      .score-factors-card { min-height: 240px; }
      .factor-copy { font-size: 9px; }
      .household-bills-page { padding: 20px 10px; }
      .household-bills-heading { align-items: flex-start; }
      .household-bills-heading h2 { max-width: 190px; font-size: 15px; line-height: 1.4; }
      .add-household-bill-button { padding: 0 8px; font-size: 9px; }
      .bill-table { min-width: 740px; }
      .bill-table thead th { padding: 0 12px; }
      .bill-table tbody th, .bill-table tbody td { padding: 0 12px; }
    }
    @media (max-width: 480px) {
      .sidebar { width: 50px; min-width: 50px; }
      .brand-mark { width: 30px; height: 30px; }
      .topbar h1 { font-size: 16px; }
      .topbar p { max-width: 270px; line-height: 1.5; }
      .top-actions { gap: 6px; }
      .button { padding: 0 8px; font-size: 9px; }
      .topbar { gap: 10px; }
      .accounts-heading { align-items: flex-start; }
      .accounts-heading h2 { max-width: 150px; line-height: 1.4; }
      .add-account-button { padding: 0 8px; font-size: 9px; }
      .account-balance strong { font-size: 17px; }
      .dashboard-content { gap: 11px; padding: 12px 10px; }
      .summary-grid { gap: 8px; }
      .summary-card { min-height: 101px; padding: 10px; }
      .summary-heading { font-size: 8px; }
      .summary-value { font-size: 15px; }
      .summary-note { font-size: 8px; }
      .panel { padding: 11px; }
      .donut-chart { width: 125px; height: 125px; }
      .donut-hole { width: 69px; height: 69px; }
      .donut-legend { gap: 5px 7px; font-size: 7px; }
      .due-row { gap: 7px; padding-right: 7px; padding-left: 7px; }
      .due-description strong, .due-amount strong { font-size: 8px; }
    }
  `]
})
export class AppComponent {
  private readonly dashboardService = inject(DashboardService);
  private readonly authService = inject(AuthService);
  private readonly changeDetector = inject(ChangeDetectorRef);
  private readonly manuallyAddedItems: DueItem[] = [];

  authView: 'app' | 'login' | 'signup' = 'login';
  authName = '';
  authEmail = '';
  authPassword = '';
  authConfirmPassword = '';
  authNotice = '';
  authSubmitting = false;
  showInsight = true;
  showEntryModal = false;
  showBankAccountModal = false;
  bankAccountsLoading = false;
  bankAccountSaving = false;
  bankAccountDeletingId: string | null = null;
  editingBankAccountId: string | null = null;
  bankAccountsError = '';
  bankAccountSaveError = '';
  bankLoansLoading = false;
  bankLoansError = '';
  bankLoanSaving = false;
  bankLoanDeletingId: string | null = null;
  editingBankLoanId: string | null = null;
  bankLoanSaveError = '';
  creditCardsLoading = false;
  creditCardsError = '';
  creditCardSaving = false;
  creditCardDeletingId: string | null = null;
  editingCreditCardId: string | null = null;
  creditCardSaveError = '';
  debitTransactionsLoading = false;
  debitTransactionsError = '';
  debitTransactionSaving = false;
  debitTransactionDeletingId: string | null = null;
  editingDebitTransactionId: string | null = null;
  debitTransactionSaveError = '';
  appLoansLoading = false;
  appLoansError = '';
  appLoanSaving = false;
  appLoanDeletingId: string | null = null;
  editingAppLoanId: string | null = null;
  appLoanSaveError = '';
  informalBorrowingsLoading = false;
  informalBorrowingsError = '';
  informalBorrowingSaving = false;
  informalBorrowingSaveError = '';
  paybackSaving = false;
  paybackSaveError = '';
  incomeSourcesLoading = false;
  incomeSourcesError = '';
  incomeSourceSaving = false;
  incomeSourceSaveError = '';
  showCreditCardModal = false;
  showDebitTransactionModal = false;
  showBankLoanModal = false;
  showAppLoanModal = false;
  showBorrowingModal = false;
  showIncomeSourceModal = false;
  showHouseholdBillModal = false;
  showMedicalExpenseModal = false;
  selectedMedicalClaim: MedicalExpense | null = null;
  currentPage: 'dashboard' | 'bank-accounts' | 'credit-score' | 'household-bills' | 'medical-expenses' | 'credit-cards' | 'debit-transactions' | 'bank-loans' | 'fintech' | 'borrowings' | 'other-income' | 'ai-assistant' = 'dashboard';
  creditScore = 785;
  reportDate = '2026-10-22';
  creditScoreError = '';
  readonly creditScoreFactors: CreditScoreFactor[] = [
    { name: 'Payment History', weight: '35%', result: '100% On-Time', progress: 100, color: 'green' },
    { name: 'Credit Utilization', weight: '30%', result: '22% (Low Risk)', progress: 22, color: 'green' },
    { name: 'Credit History Age', weight: '15%', result: '4 Yrs 8 Mos', progress: 65, color: 'amber' },
    { name: 'Total Credit Accounts', weight: '10%', result: '7 Active Lines', progress: 80, color: 'blue' }
  ];
  entryFormValues = this.createEmptyEntry();
  bankAccountFormValues = this.createEmptyBankAccount();
  creditCardFormValues = this.createEmptyCreditCard();
  creditCards: CreditCard[] = [];
  debitTransactionFormValues = this.createEmptyDebitTransaction();
  debitTransactions: DebitTransaction[] = [];
  bankLoanFormValues = this.createEmptyBankLoan();
  bankLoans: BankLoan[] = [];
  appLoanFormValues = this.createEmptyAppLoan();
  appLoans: AppLoan[] = [];
  borrowingFormValues = this.createEmptyBorrowing();
  informalBorrowings: InformalBorrowing[] = [];
  selectedPaybackBorrowing: InformalBorrowing | null = null;
  paybackAmount = 0;
  incomeSourceFormValues = this.createEmptyIncomeSource();
  incomeSources: IncomeSource[] = [];
  assistantPrompt = '';
  assistantMessages: AssistantMessage[] = [];
  private nextAssistantMessageId = 1;
  householdBillFormValues = this.createEmptyHouseholdBill();
  householdBills: HouseholdBill[] = [];
  householdBillsError = '';
  householdBillsLoading = false;
  householdBillSaving = false;
  householdBillDeletingId: string | null = null;
  editingHouseholdBillId: string | null = null;
  householdBillSuccessMessage = '';
  medicalExpenses: MedicalExpense[] = [];
  medicalExpensesError = '';
  medicalExpensesLoading = false;
  medicalExpenseSaving = false;
  medicalExpenseDeletingId: string | null = null;
  medicalExpenseSaveError = '';
  medicalExpenseOperationMessage = '';
  medicalExpenseOperationSucceeded = false;
  editingMedicalExpenseId: string | null = null;
  medicalExpenseFormValues = this.createEmptyMedicalExpense();
  bankAccounts: BankAccount[] = [];
  dueItems: DueItem[] = [
    { name: 'City Power Corp', dueDate: '2026-11-05', amount: 145.5, status: 'Pending' },
    { name: 'Metropolitan Gas', dueDate: '2026-11-08', amount: 48, status: 'Pending' },
    { name: 'Supermarket Groceries', dueDate: '2026-10-30', amount: 620, status: 'Pending' }
  ];

  get pageTitle(): string {
    if (this.currentPage === 'bank-accounts') {
      return 'Bank Accounts & Reserves';
    }

    if (this.currentPage === 'credit-score') {
      return 'Credit Score & Health Report';
    }

    if (this.currentPage === 'household-bills') {
      return 'Household Utility Bills';
    }

    if (this.currentPage === 'medical-expenses') {
      return 'Medical & Hospital Expenses';
    }

    if (this.currentPage === 'credit-cards') {
      return 'Credit Card Bills & Limits';
    }

    if (this.currentPage === 'debit-transactions') {
      return 'Debit Card Transactions';
    }

    if (this.currentPage === 'bank-loans') {
      return 'Bank Loans & Mortgages';
    }

    if (this.currentPage === 'fintech') {
      return 'Fintech & App Loans';
    }

    if (this.currentPage === 'borrowings') {
      return 'Other Informal Borrowings';
    }

    if (this.currentPage === 'other-income') {
      return 'Other Income & Side Hustles';
    }

    if (this.currentPage === 'ai-assistant') {
      return 'AI Financial Assistant';
    }

    return 'Financial Dashboard';
  }

  get profileName(): string {
    return this.authName || this.authService.currentSession?.fullName || 'John Doe';
  }

  get profileEmail(): string {
    return this.authEmail || this.authService.currentSession?.email || 'john.doe@example.com';
  }

  get profileInitials(): string {
    return this.profileName.split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0].toUpperCase()).join('');
  }

  showLogin(): void {
    this.authView = 'login';
    this.authNotice = '';
    this.authPassword = '';
    this.authConfirmPassword = '';
  }

  showSignup(): void {
    this.authView = 'signup';
    this.authNotice = '';
    this.authPassword = '';
    this.authConfirmPassword = '';
  }

  submitAuthForm(): void {
    this.authNotice = '';
    this.authSubmitting = true;
    const request = this.authView === 'signup'
      ? this.authService.register({
        fullName: this.authName.trim(),
        email: this.authEmail.trim(),
        password: this.authPassword
      })
      : this.authService.login({
        email: this.authEmail.trim(),
        password: this.authPassword
      });

    request.subscribe({
      next: (session: AuthResponse) => {
        this.authService.startSession(session);
        this.authName = session.fullName;
        this.authEmail = session.email;
        this.authPassword = '';
        this.authConfirmPassword = '';
        this.authSubmitting = false;
        this.authNotice = '';
        this.authView = 'app';
        this.loadDashboardData();
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.authSubmitting = false;
        this.authNotice = this.getAuthErrorMessage(error);
        this.changeDetector.markForCheck();
      }
    });
  }

  signOut(): void {
    this.authService.signOut();
    this.authName = '';
    this.authEmail = '';
    this.authPassword = '';
    this.authConfirmPassword = '';
    this.currentPage = 'dashboard';
    this.authNotice = 'You have signed out.';
    this.authView = 'login';
  }

  private getAuthErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'Authentication failed unexpectedly. Please try again.';
    }

    if (error.status === 0) {
      return 'Unable to reach the UserService. Start the API and check its database and signing-key configuration.';
    }

    const response = error.error as {
      detail?: unknown;
      errors?: unknown;
      title?: unknown;
    } | null;
    if (response?.errors && typeof response.errors === 'object') {
      for (const messages of Object.values(response.errors)) {
        if (Array.isArray(messages)) {
          const validationMessage = messages.find(
            (message): message is string => typeof message === 'string'
          );
          if (validationMessage) {
            return validationMessage;
          }
        }
      }
    }

    return (typeof response?.detail === 'string' ? response.detail : undefined)
      ?? (typeof response?.title === 'string' ? response.title : undefined)
      ?? 'Authentication failed. Please try again.';
  }

  get pageDescription(): string {
    if (this.currentPage === 'bank-accounts') {
      return 'Manage primary checking, savings, and reserve accounts.';
    }

    if (this.currentPage === 'credit-score') {
      return 'CIBIL / Experian score metrics and risk breakdown.';
    }

    if (this.currentPage === 'household-bills') {
      return 'Electricity, Gas, Property & Water tax payments.';
    }

    if (this.currentPage === 'medical-expenses') {
      return 'Track doctor visits, pharmacy bills, and insurance claims.';
    }

    if (this.currentPage === 'credit-cards') {
      return 'Monitor total credit balance, minimum dues, and utilization.';
    }

    if (this.currentPage === 'debit-transactions') {
      return 'Recent debit account spendings and log entries.';
    }

    if (this.currentPage === 'bank-loans') {
      return 'Personal & housing loan EMI trackings.';
    }

    if (this.currentPage === 'fintech') {
      return 'Instant PayLater and micro-credit line status.';
    }

    if (this.currentPage === 'borrowings') {
      return 'Manage loans from friends, family, or personal sources.';
    }

    if (this.currentPage === 'other-income') {
      return 'Alternative streams like freelance income and dividends.';
    }

    if (this.currentPage === 'ai-assistant') {
      return 'Personalized financial advisor for debt payoff and budgeting strategies.';
    }

    return 'Real-time overview of your net worth, liabilities, and monthly cash flow.';
  }

  get scoreArcLength(): number {
    return Math.max(0, Math.min(this.creditScore, 900)) / 900 * 307.88;
  }

  get scoreStatus(): string {
    if (this.creditScore >= 750) {
      return 'Excellent Standing';
    }

    if (this.creditScore >= 700) {
      return 'Good Standing';
    }

    if (this.creditScore >= 650) {
      return 'Fair Standing';
    }

    return 'Needs Improvement';
  }

  private loadDashboardData(): void {
    const userId = this.authService.currentSession?.userId;
    if (!userId) {
      return;
    }

    this.bankAccountsLoading = true;
    this.bankAccountsError = '';
    this.dashboardService.getBankAccounts(userId).subscribe({
      next: (accounts: BankAccount[]) => {
        this.bankAccounts = accounts;
        this.bankAccountsLoading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.bankAccountsLoading = false;
        this.bankAccountsError = 'Unable to load bank accounts. Please try again later.';
        console.error('Unable to load bank accounts.', error);
        this.changeDetector.markForCheck();
      }
    });

    this.bankLoansLoading = true;
    this.bankLoansError = '';
    this.dashboardService.getBankLoans(userId).subscribe({
      next: (loans: BankLoanRecord[]) => {
        this.bankLoans = loans.map((loan) => ({
          id: loan.loanId,
          lender: loan.lender,
          type: loan.type,
          interestRate: loan.interestRate,
          monthlyEmi: loan.monthlyEmi,
          principalRemaining: loan.principalRemaining,
          yearsRemaining: loan.yearsRemaining
        }));
        this.bankLoansLoading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.bankLoansLoading = false;
        this.bankLoansError = 'Unable to load bank loans. Please try again later.';
        console.error('Unable to load bank loans.', error);
        this.changeDetector.markForCheck();
      }
    });

    this.creditCardsLoading = true;
    this.creditCardsError = '';
    this.dashboardService.getCreditCardStatements(userId).subscribe({
      next: (statements: CreditCardStatement[]) => {
        this.creditCards = statements.map((statement) => this.toCreditCard(statement));
        this.creditCardsLoading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.creditCardsLoading = false;
        this.creditCardsError = 'Unable to load credit card statements. Please try again later.';
        console.error('Unable to load credit card statements.', error);
        this.changeDetector.markForCheck();
      }
    });

    this.debitTransactionsLoading = true;
    this.debitTransactionsError = '';
    this.dashboardService.getDebitTransactions(userId).subscribe({
      next: (transactions: DebitTransactionRecord[]) => {
        this.debitTransactions = transactions.map((transaction) => this.toDebitTransaction(transaction));
        this.debitTransactionsLoading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.debitTransactionsLoading = false;
        this.debitTransactionsError = 'Unable to load debit transactions. Please try again later.';
        console.error('Unable to load debit transactions.', error);
        this.changeDetector.markForCheck();
      }
    });

    this.appLoansLoading = true;
    this.appLoansError = '';
    this.dashboardService.getThirdPartyLoans(userId).subscribe({
      next: (loans: ThirdPartyLoan[]) => {
        this.appLoans = loans.map((loan) => this.toAppLoan(loan));
        this.appLoansLoading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.appLoansLoading = false;
        this.appLoansError = 'Unable to load app loans. Please try again later.';
        console.error('Unable to load app loans.', error);
        this.changeDetector.markForCheck();
      }
    });

    this.informalBorrowingsLoading = true;
    this.informalBorrowingsError = '';
    this.dashboardService.getInformalDebts(userId).subscribe({
      next: (debts: InformalDebt[]) => {
        this.informalBorrowings = debts.map((debt) => this.toInformalBorrowing(debt));
        this.informalBorrowingsLoading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.informalBorrowingsLoading = false;
        this.informalBorrowingsError = 'Unable to load other borrowings. Please try again later.';
        console.error('Unable to load other borrowings.', error);
        this.changeDetector.markForCheck();
      }
    });

    this.incomeSourcesLoading = true;
    this.incomeSourcesError = '';
    this.dashboardService.getOtherIncomeSources(userId).subscribe({
      next: (sources: OtherIncomeSource[]) => {
        this.incomeSources = sources.map((source) => this.toIncomeSource(source));
        this.incomeSourcesLoading = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.incomeSourcesLoading = false;
        this.incomeSourcesError = 'Unable to load income sources. Please try again later.';
        console.error('Unable to load income sources.', error);
        this.changeDetector.markForCheck();
      }
    });

    this.householdBillsLoading = true;
    this.dashboardService.getHouseholdBills(userId).subscribe({
      next: (bills: HouseholdBill[]) => {
        this.householdBills = bills;
        this.householdBillsLoading = false;
        this.householdBillsError = '';
        if (bills.length > 0) {
          this.dueItems = [...this.manuallyAddedItems, ...bills.slice(0, 3).map((bill) => ({
            name: bill.provider || bill.category,
            dueDate: bill.dueDate,
            amount: bill.amount,
            status: bill.status,
            category: bill.category
          }))];
        }
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.householdBillsLoading = false;
        this.householdBillsError = 'Unable to load household bills. Please try again later.';
        console.error('Unable to load household bills.', error);
        this.changeDetector.markForCheck();
      }
    });
    this.dashboardService.getCreditScore(userId).subscribe({
      next: (report: CreditScoreReport) => {
        this.creditScore = report.creditScore;
        this.reportDate = report.reportDate;
        this.creditScoreError = '';
      },
      error: (error: unknown) => {
        this.creditScoreError = 'Unable to refresh bureau data. Showing the last saved score.';
        console.error('Unable to load credit score report.', error);
      }
    });
    this.medicalExpensesLoading = true;
    this.dashboardService.getMedicalExpenses(userId).subscribe({
      next: (expenses: MedicalExpenseSummary[]) => {
        this.medicalExpenses = expenses;
        this.medicalExpensesLoading = false;
        this.medicalExpensesError = '';
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.medicalExpensesLoading = false;
        this.medicalExpensesError = 'Unable to load medical expenses. Please try again later.';
        console.error('Unable to load medical expenses.', error);
        this.changeDetector.markForCheck();
      }
    });
  }

  @HostListener('document:keydown.escape')
  closeEntryModalOnEscape(): void {
    if (this.showEntryModal) {
      this.closeEntryModal();
    }
    if (this.showBankAccountModal) {
      this.closeBankAccountModal();
    }
    if (this.showCreditCardModal) {
      this.closeCreditCardModal();
    }
    if (this.showDebitTransactionModal) {
      this.closeDebitTransactionModal();
    }
    if (this.showBankLoanModal) {
      this.closeBankLoanModal();
    }
    if (this.showAppLoanModal) {
      this.closeAppLoanModal();
    }
    if (this.showBorrowingModal) {
      this.closeBorrowingModal();
    }
    if (this.showIncomeSourceModal) {
      this.closeIncomeSourceModal();
    }
    if (this.selectedPaybackBorrowing) {
      this.closePaybackModal();
    }
    if (this.showHouseholdBillModal) {
      this.closeHouseholdBillModal();
    }
    if (this.showMedicalExpenseModal) {
      this.closeMedicalExpenseModal();
    }
    if (this.selectedMedicalClaim) {
      this.closeMedicalClaim();
    }
  }

  showPage(page: 'dashboard' | 'bank-accounts' | 'credit-score' | 'household-bills' | 'medical-expenses' | 'credit-cards' | 'debit-transactions' | 'bank-loans' | 'fintech' | 'borrowings' | 'other-income' | 'ai-assistant'): void {
    this.currentPage = page;
    this.closeBankAccountModal();
    this.closeCreditCardModal();
    this.closeDebitTransactionModal();
    this.closeBankLoanModal();
    this.closeAppLoanModal();
    this.closeBorrowingModal();
    this.closePaybackModal();
    this.closeIncomeSourceModal();
    this.closeEntryModal();
    this.closeHouseholdBillModal();
    this.closeMedicalExpenseModal();
    this.closeMedicalClaim();
  }

  openEntryModal(): void {
    this.entryFormValues = this.createEmptyEntry();
    this.showEntryModal = true;
  }

  closeEntryModal(): void {
    this.showEntryModal = false;
  }

  openBankAccountModal(): void {
    this.bankAccountFormValues = this.createEmptyBankAccount();
    this.editingBankAccountId = null;
    this.bankAccountSaveError = '';
    this.showBankAccountModal = true;
  }

  editBankAccount(account: BankAccount): void {
    this.bankAccountFormValues = {
      bankName: account.bankName,
      accountType: account.accountType,
      lastFour: account.lastFour,
      balance: account.balance,
      ifsc: account.ifsc
    };
    this.editingBankAccountId = account.bankAccountId;
    this.bankAccountSaveError = '';
    this.showBankAccountModal = true;
  }

  closeBankAccountModal(): void {
    this.showBankAccountModal = false;
    this.editingBankAccountId = null;
    this.bankAccountSaveError = '';
  }

  openCreditCardModal(): void {
    this.creditCardFormValues = this.createEmptyCreditCard();
    this.editingCreditCardId = null;
    this.creditCardSaveError = '';
    this.showCreditCardModal = true;
  }

  editCreditCard(card: CreditCard): void {
    this.creditCardFormValues = {
      name: card.name,
      statementBalance: card.statementBalance,
      minimumDue: card.minimumDue,
      dueDate: card.dueDate,
      creditLimit: card.creditLimit
    };
    this.editingCreditCardId = card.id;
    this.creditCardSaveError = '';
    this.showCreditCardModal = true;
  }

  closeCreditCardModal(): void {
    if (this.creditCardSaving) {
      return;
    }
    this.showCreditCardModal = false;
    this.editingCreditCardId = null;
    this.creditCardSaveError = '';
  }

  canSaveCreditCard(): boolean {
    const form = this.creditCardFormValues;
    return Boolean(
      form.name.trim() &&
      form.name.trim().length <= 100 &&
      form.dueDate &&
      Number.isFinite(form.statementBalance) &&
      form.statementBalance >= 0 &&
      Number.isFinite(form.minimumDue) &&
      form.minimumDue >= 0 &&
      form.minimumDue <= form.statementBalance &&
      Number.isFinite(form.creditLimit) &&
      form.creditLimit > 0
    );
  }

  saveCreditCard(): void {
    const userId = this.authService.currentSession?.userId;
    if (!userId || !this.canSaveCreditCard() || this.creditCardSaving) {
      return;
    }

    const request: CreateCreditCardStatementRequest = {
      issuerName: this.creditCardFormValues.name.trim(),
      statementBalance: this.creditCardFormValues.statementBalance,
      minimumDue: this.creditCardFormValues.minimumDue,
      dueDate: this.creditCardFormValues.dueDate,
      creditLimit: this.creditCardFormValues.creditLimit
    };
    const editingCreditCardId = this.editingCreditCardId;
    this.creditCardSaving = true;
    this.creditCardSaveError = '';
    const saveRequest = editingCreditCardId
      ? this.dashboardService.updateCreditCardStatement(userId, editingCreditCardId, request)
      : this.dashboardService.createCreditCardStatement(userId, request);
    saveRequest.subscribe({
      next: (statement: CreditCardStatement) => {
        this.creditCards = editingCreditCardId
          ? this.creditCards.map((card) => card.id === statement.cardId ? this.toCreditCard(statement) : card)
          : [...this.creditCards, this.toCreditCard(statement)];
        this.creditCardSaving = false;
        this.closeCreditCardModal();
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.creditCardSaving = false;
        this.creditCardSaveError = this.getCreditCardSaveErrorMessage(error, Boolean(editingCreditCardId));
        console.error(editingCreditCardId ? 'Unable to update credit card statement.' : 'Unable to save credit card statement.', error);
        this.changeDetector.markForCheck();
      }
    });
  }

  deleteCreditCard(card: CreditCard): void {
    const userId = this.authService.currentSession?.userId;
    if (!userId || this.creditCardSaving || this.creditCardDeletingId) {
      return;
    }

    this.creditCardDeletingId = card.id;
    this.creditCardsError = '';
    this.dashboardService.deleteCreditCardStatement(userId, card.id).subscribe({
      next: () => {
        this.creditCards = this.creditCards.filter((item) => item.id !== card.id);
        this.creditCardDeletingId = null;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.creditCardDeletingId = null;
        this.creditCardsError = 'Unable to delete this credit card. Please try again.';
        console.error('Unable to delete credit card statement.', error);
        this.changeDetector.markForCheck();
      }
    });
  }

  creditCardUtilization(card: CreditCard): number {
    return Math.min(100, Math.round(card.statementBalance / card.creditLimit * 100));
  }

  trackCreditCard(_index: number, card: CreditCard): string {
    return card.id;
  }

  private toCreditCard(statement: CreditCardStatement): CreditCard {
    return {
      id: statement.cardId,
      name: statement.issuerName,
      statementBalance: statement.statementBalance,
      minimumDue: statement.minimumDue,
      dueDate: statement.dueDate,
      creditLimit: statement.creditLimit
    };
  }

  private getCreditCardSaveErrorMessage(error: unknown, isUpdate = false): string {
    if (!(error instanceof HttpErrorResponse)) {
      return `An unexpected error occurred while ${isUpdate ? 'updating' : 'saving'} the credit card. Please try again.`;
    }

    if (error.status === 0) {
      return 'Unable to reach the API gateway. Confirm the gateway and BankingLoanService are running, then try again.';
    }

    if (error.status === 400) {
      const body: unknown = error.error;
      if (body && typeof body === 'object' && 'errors' in body) {
        const validationErrors = body.errors;
        if (validationErrors && typeof validationErrors === 'object') {
          const messages = Object.values(validationErrors).flatMap((value): string[] => {
            if (Array.isArray(value)) {
              return value.filter((message): message is string => typeof message === 'string');
            }
            return typeof value === 'string' ? [value] : [];
          });
          if (messages.length > 0) {
            return `Credit card details were rejected: ${messages.join(' ')}`;
          }
        }
      }

      return 'Check the card name, due date, and amounts. Minimum due cannot exceed statement balance.';
    }

    if (error.status === 404) {
      return 'The credit card or API endpoint was not found. Refresh the card list and restart BankingLoanService with the latest build.';
    }

    return `BankingLoanService could not ${isUpdate ? 'update' : 'save'} the credit card (HTTP ${error.status}). Check the service log for details.`;
  }

  openDebitTransactionModal(): void {
    this.debitTransactionFormValues = this.createEmptyDebitTransaction();
    this.editingDebitTransactionId = null;
    this.debitTransactionSaveError = '';
    this.showDebitTransactionModal = true;
  }

  editDebitTransaction(transaction: DebitTransaction): void {
    this.debitTransactionFormValues = {
      date: transaction.date,
      accountId: transaction.accountId,
      merchant: transaction.merchant,
      amount: transaction.amount,
      category: transaction.category
    };
    this.editingDebitTransactionId = transaction.id;
    this.debitTransactionSaveError = '';
    this.showDebitTransactionModal = true;
  }

  closeDebitTransactionModal(): void {
    if (this.debitTransactionSaving) {
      return;
    }
    this.showDebitTransactionModal = false;
    this.editingDebitTransactionId = null;
    this.debitTransactionSaveError = '';
  }

  canSaveDebitTransaction(): boolean {
    const form = this.debitTransactionFormValues;
    return Boolean(
      form.date &&
      form.accountId &&
      form.merchant.trim() &&
      form.merchant.trim().length <= 150 &&
      form.category.trim() &&
      form.category.trim().length <= 50 &&
      Number.isFinite(form.amount) &&
      form.amount > 0
    );
  }

  saveDebitTransaction(): void {
    const userId = this.authService.currentSession?.userId;
    if (!userId || !this.canSaveDebitTransaction() || this.debitTransactionSaving) {
      return;
    }

    const request: CreateDebitTransactionRequest = {
      accountId: this.debitTransactionFormValues.accountId,
      transactionDate: this.debitTransactionFormValues.date,
      merchantName: this.debitTransactionFormValues.merchant.trim(),
      amount: this.debitTransactionFormValues.amount,
      category: this.debitTransactionFormValues.category.trim()
    };
    const editingDebitTransactionId = this.editingDebitTransactionId;
    this.debitTransactionSaving = true;
    this.debitTransactionSaveError = '';
    const saveRequest = editingDebitTransactionId
      ? this.dashboardService.updateDebitTransaction(userId, editingDebitTransactionId, request)
      : this.dashboardService.createDebitTransaction(userId, request);
    saveRequest.subscribe({
      next: (transaction: DebitTransactionRecord) => {
        this.debitTransactions = editingDebitTransactionId
          ? this.debitTransactions.map((item) => item.id === transaction.transactionId ? this.toDebitTransaction(transaction) : item)
          : [this.toDebitTransaction(transaction), ...this.debitTransactions];
        this.debitTransactionSaving = false;
        this.closeDebitTransactionModal();
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.debitTransactionSaving = false;
        this.debitTransactionSaveError = this.getDebitTransactionSaveErrorMessage(error, Boolean(editingDebitTransactionId));
        console.error(editingDebitTransactionId ? 'Unable to update debit transaction.' : 'Unable to save debit transaction.', error);
        this.changeDetector.markForCheck();
      }
    });
  }

  deleteDebitTransaction(transaction: DebitTransaction): void {
    const userId = this.authService.currentSession?.userId;
    if (!userId || this.debitTransactionSaving || this.debitTransactionDeletingId) {
      return;
    }

    this.debitTransactionDeletingId = transaction.id;
    this.debitTransactionsError = '';
    this.dashboardService.deleteDebitTransaction(userId, transaction.id).subscribe({
      next: () => {
        this.debitTransactions = this.debitTransactions.filter((item) => item.id !== transaction.id);
        this.debitTransactionDeletingId = null;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.debitTransactionDeletingId = null;
        this.debitTransactionsError = 'Unable to delete this debit transaction. Please try again.';
        console.error('Unable to delete debit transaction.', error);
        this.changeDetector.markForCheck();
      }
    });
  }

  trackDebitTransaction(_index: number, transaction: DebitTransaction): string {
    return transaction.id;
  }

  private toDebitTransaction(transaction: DebitTransactionRecord): DebitTransaction {
    return {
      id: transaction.transactionId,
      date: transaction.transactionDate,
      bankAccount: transaction.bankAccount,
      accountId: transaction.accountId,
      merchant: transaction.merchantName,
      amount: transaction.amount,
      category: transaction.category
    };
  }

  private getDebitTransactionSaveErrorMessage(error: unknown, isUpdate = false): string {
    if (!(error instanceof HttpErrorResponse)) {
      return `An unexpected error occurred while ${isUpdate ? 'updating' : 'saving'} the debit transaction. Please try again.`;
    }

    if (error.status === 0) {
      return 'Unable to reach the API gateway. Confirm the gateway and BankingLoanService are running, then try again.';
    }

    if (error.status === 400) {
      return 'Check the selected account, date, merchant, amount, and category.';
    }

    if (error.status === 404) {
      return 'The selected bank account or debit-transaction API endpoint was not found. Refresh accounts and restart BankingLoanService if needed.';
    }

    return `BankingLoanService could not ${isUpdate ? 'update' : 'save'} the debit transaction (HTTP ${error.status}). Check the service log for details.`;
  }

  openBankLoanModal(): void {
    this.bankLoanFormValues = this.createEmptyBankLoan();
    this.editingBankLoanId = null;
    this.bankLoanSaveError = '';
    this.showBankLoanModal = true;
  }

  editBankLoan(loan: BankLoan): void {
    this.bankLoanFormValues = {
      lender: loan.lender,
      type: loan.type,
      interestRate: loan.interestRate,
      monthlyEmi: loan.monthlyEmi,
      principalRemaining: loan.principalRemaining,
      yearsRemaining: loan.yearsRemaining
    };
    this.editingBankLoanId = loan.id;
    this.bankLoanSaveError = '';
    this.showBankLoanModal = true;
  }

  closeBankLoanModal(): void {
    if (this.bankLoanSaving) {
      return;
    }
    this.showBankLoanModal = false;
    this.editingBankLoanId = null;
    this.bankLoanSaveError = '';
  }

  canSaveBankLoan(): boolean {
    const form = this.bankLoanFormValues;
    return Boolean(
      form.lender.trim() &&
      form.lender.trim().length <= 150 &&
      ['Home Loan', 'Personal Loan', 'Vehicle Loan', 'Other'].includes(form.type) &&
      Number.isFinite(form.interestRate) &&
      form.interestRate >= 0 &&
      form.interestRate <= 999.99 &&
      Number.isFinite(form.monthlyEmi) &&
      form.monthlyEmi > 0 &&
      form.monthlyEmi <= 9999999999999999 &&
      Number.isFinite(form.principalRemaining) &&
      form.principalRemaining >= 0 &&
      form.principalRemaining <= 9999999999999999 &&
      Number.isFinite(form.yearsRemaining) &&
      form.yearsRemaining > 0 &&
      form.yearsRemaining <= 9999.99
    );
  }

  saveBankLoan(): void {
    const userId = this.authService.currentSession?.userId;
    if (!userId || !this.canSaveBankLoan() || this.bankLoanSaving) {
      return;
    }

    const request: CreateBankLoanRequest = {
      ...this.bankLoanFormValues,
      lender: this.bankLoanFormValues.lender.trim()
    };
    const editingBankLoanId = this.editingBankLoanId;
    this.bankLoanSaving = true;
    this.bankLoanSaveError = '';
    const saveRequest = editingBankLoanId
      ? this.dashboardService.updateBankLoan(userId, editingBankLoanId, request)
      : this.dashboardService.createBankLoan(userId, request);
    saveRequest.subscribe({
      next: (loan: BankLoanRecord) => {
        const updatedLoan: BankLoan = {
            id: loan.loanId,
            lender: loan.lender,
            type: loan.type,
            interestRate: loan.interestRate,
            monthlyEmi: loan.monthlyEmi,
            principalRemaining: loan.principalRemaining,
            yearsRemaining: loan.yearsRemaining
        };
        this.bankLoans = editingBankLoanId
          ? this.bankLoans.map((item) => item.id === loan.loanId ? updatedLoan : item)
          : [updatedLoan, ...this.bankLoans];
        this.bankLoanSaving = false;
        this.closeBankLoanModal();
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.bankLoanSaving = false;
        this.bankLoanSaveError = this.getBankLoanSaveErrorMessage(error);
        console.error(editingBankLoanId ? 'Unable to update bank loan.' : 'Unable to save bank loan.', error);
        this.changeDetector.markForCheck();
      }
    });
  }

  deleteBankLoan(loan: BankLoan): void {
    const userId = this.authService.currentSession?.userId;
    if (!userId || this.bankLoanSaving || this.bankLoanDeletingId) {
      return;
    }

    this.bankLoanDeletingId = loan.id;
    this.bankLoansError = '';
    this.dashboardService.deleteBankLoan(userId, loan.id).subscribe({
      next: () => {
        this.bankLoans = this.bankLoans.filter((item) => item.id !== loan.id);
        this.bankLoanDeletingId = null;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.bankLoanDeletingId = null;
        this.bankLoansError = 'Unable to delete this bank loan. Please try again.';
        console.error('Unable to delete bank loan.', error);
        this.changeDetector.markForCheck();
      }
    });
  }

  private getBankLoanSaveErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'An unexpected error occurred while saving the bank loan. Please try again.';
    }

    if (error.status === 0) {
      return 'Unable to reach the API gateway. Confirm the gateway and BankingLoanService are running, then try again.';
    }

    if (error.status === 400) {
      const body: unknown = error.error;
      if (body && typeof body === 'object' && 'errors' in body) {
        const validationErrors = body.errors;
        if (validationErrors && typeof validationErrors === 'object') {
          const messages = Object.values(validationErrors).flatMap((value): string[] => {
            if (Array.isArray(value)) {
              return value.filter((message): message is string => typeof message === 'string');
            }
            return typeof value === 'string' ? [value] : [];
          });
          if (messages.length > 0) {
            return `Loan details were rejected: ${messages.join(' ')}`;
          }
        }
      }

      return 'The API rejected the loan details. Check that the loan type is valid, interest rate is 0–999.99%, EMI is greater than 0, and remaining years is greater than 0.';
    }

    if (error.status === 404) {
      return 'The bank-loan API endpoint was not found. Stop any stale BankingLoanService instance, rebuild it, and restart the service.';
    }

    return `BankingLoanService could not save the loan (HTTP ${error.status}). Check the service log for the database error and try again.`;
  }

  trackBankLoan(_index: number, loan: BankLoan): string {
    return loan.id;
  }

  openAppLoanModal(): void {
    this.appLoanFormValues = this.createEmptyAppLoan();
    this.editingAppLoanId = null;
    this.appLoanSaveError = '';
    this.showAppLoanModal = true;
  }

  editAppLoan(loan: AppLoan): void {
    this.appLoanFormValues = {
      appName: loan.appName,
      type: loan.type,
      outstandingBalance: loan.outstandingBalance,
      nextEmi: loan.nextEmi,
      dueDate: loan.dueDate
    };
    this.editingAppLoanId = loan.id;
    this.appLoanSaveError = '';
    this.showAppLoanModal = true;
  }

  closeAppLoanModal(): void {
    if (this.appLoanSaving) {
      return;
    }
    this.showAppLoanModal = false;
    this.editingAppLoanId = null;
    this.appLoanSaveError = '';
  }

  canSaveAppLoan(): boolean {
    const form = this.appLoanFormValues;
    return Boolean(
      form.appName.trim() &&
      form.appName.trim().length <= 100 &&
      Number.isFinite(form.outstandingBalance) &&
      form.outstandingBalance >= 0 &&
      Number.isFinite(form.nextEmi) &&
      form.nextEmi >= 0 &&
      form.dueDate
    );
  }

  saveAppLoan(): void {
    const userId = this.authService.currentSession?.userId;
    if (!userId || !this.canSaveAppLoan() || this.appLoanSaving) {
      return;
    }

    const request: CreateThirdPartyLoanRequest = {
      appName: this.appLoanFormValues.appName.trim(),
      type: this.appLoanFormValues.type,
      outstandingBalance: this.appLoanFormValues.outstandingBalance,
      nextEmi: this.appLoanFormValues.nextEmi,
      dueDate: this.appLoanFormValues.dueDate
    };
    const editingAppLoanId = this.editingAppLoanId;
    this.appLoanSaving = true;
    this.appLoanSaveError = '';
    const saveRequest = editingAppLoanId
      ? this.dashboardService.updateThirdPartyLoan(userId, editingAppLoanId, request)
      : this.dashboardService.createThirdPartyLoan(userId, request);
    saveRequest.subscribe({
      next: (loan: ThirdPartyLoan) => {
        this.appLoans = editingAppLoanId
          ? this.appLoans.map((item) => item.id === loan.loanId ? this.toAppLoan(loan) : item)
          : [...this.appLoans, this.toAppLoan(loan)];
        this.appLoanSaving = false;
        this.closeAppLoanModal();
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.appLoanSaving = false;
        this.appLoanSaveError = this.getAppLoanSaveErrorMessage(error);
        console.error(editingAppLoanId ? 'Unable to update app loan.' : 'Unable to save app loan.', error);
        this.changeDetector.markForCheck();
      }
    });
  }

  deleteAppLoan(loan: AppLoan): void {
    const userId = this.authService.currentSession?.userId;
    if (!userId || this.appLoanSaving || this.appLoanDeletingId) {
      return;
    }

    this.appLoanDeletingId = loan.id;
    this.appLoansError = '';
    this.dashboardService.deleteThirdPartyLoan(userId, loan.id).subscribe({
      next: () => {
        this.appLoans = this.appLoans.filter((item) => item.id !== loan.id);
        this.appLoanDeletingId = null;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.appLoanDeletingId = null;
        this.appLoansError = 'Unable to delete this fintech / PayLater loan. Please try again.';
        console.error('Unable to delete app loan.', error);
        this.changeDetector.markForCheck();
      }
    });
  }

  trackAppLoan(_index: number, loan: AppLoan): string {
    return loan.id;
  }

  private toAppLoan(loan: ThirdPartyLoan): AppLoan {
    return {
      id: loan.loanId,
      appName: loan.appName,
      type: loan.type,
      outstandingBalance: loan.outstandingBalance,
      nextEmi: loan.nextEmi,
      dueDate: loan.dueDate
    };
  }

  private getAppLoanSaveErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'An unexpected error occurred while saving the app loan. Please try again.';
    }

    if (error.status === 0) {
      return 'Unable to reach the API gateway. Confirm the gateway and BankingLoanService are running, then try again.';
    }

    if (error.status === 400) {
      return 'Check the app name, loan type, outstanding balance, next EMI, and due date.';
    }

    if (error.status === 404) {
      return 'The third-party loan API endpoint was not found. Restart BankingLoanService with the latest build.';
    }

    return `BankingLoanService could not save the app loan (HTTP ${error.status}). Check the service log for details.`;
  }

  openBorrowingModal(): void {
    this.borrowingFormValues = this.createEmptyBorrowing();
    this.informalBorrowingSaveError = '';
    this.showBorrowingModal = true;
  }

  closeBorrowingModal(): void {
    if (this.informalBorrowingSaving) {
      return;
    }
    this.showBorrowingModal = false;
    this.informalBorrowingSaveError = '';
  }

  canSaveBorrowing(): boolean {
    const form = this.borrowingFormValues;
    return Boolean(
      form.lender.trim() &&
      form.notes.trim() &&
      Number.isFinite(form.initialAmount) &&
      form.initialAmount > 0 &&
      form.targetRepaymentDate
    );
  }

  saveBorrowing(): void {
    const userId = this.authService.currentSession?.userId;
    if (!userId || !this.canSaveBorrowing() || this.informalBorrowingSaving) {
      return;
    }

    const request: CreateInformalDebtRequest = {
      lenderName: this.borrowingFormValues.lender.trim(),
      notes: this.borrowingFormValues.notes.trim(),
      originalAmount: this.borrowingFormValues.initialAmount,
      targetRepaymentDate: this.borrowingFormValues.targetRepaymentDate
    };
    this.informalBorrowingSaving = true;
    this.informalBorrowingSaveError = '';
    this.dashboardService.createInformalDebt(userId, request).subscribe({
      next: (debt: InformalDebt) => {
        this.informalBorrowings = [...this.informalBorrowings, this.toInformalBorrowing(debt)];
        this.informalBorrowingSaving = false;
        this.showBorrowingModal = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.informalBorrowingSaving = false;
        this.informalBorrowingSaveError = this.getInformalDebtErrorMessage(error, 'save');
        console.error('Unable to save other borrowing.', error);
        this.changeDetector.markForCheck();
      }
    });
  }

  trackInformalBorrowing(_index: number, borrowing: InformalBorrowing): string {
    return borrowing.id;
  }

  openPaybackModal(borrowing: InformalBorrowing): void {
    this.paybackAmount = 0;
    this.paybackSaveError = '';
    this.selectedPaybackBorrowing = borrowing;
  }

  closePaybackModal(): void {
    if (this.paybackSaving) {
      return;
    }
    this.selectedPaybackBorrowing = null;
    this.paybackAmount = 0;
    this.paybackSaveError = '';
  }

  canSavePayback(): boolean {
    return Boolean(
      this.selectedPaybackBorrowing &&
      Number.isFinite(this.paybackAmount) &&
      this.paybackAmount > 0 &&
      this.paybackAmount <= this.selectedPaybackBorrowing.remainingBalance
    );
  }

  savePayback(): void {
    const userId = this.authService.currentSession?.userId;
    if (!userId || !this.selectedPaybackBorrowing || !this.canSavePayback() || this.paybackSaving) {
      return;
    }

    const debtId = this.selectedPaybackBorrowing.id;
    const request: RecordInformalDebtPaybackRequest = { amount: this.paybackAmount };
    this.paybackSaving = true;
    this.paybackSaveError = '';
    this.dashboardService.recordInformalDebtPayback(userId, debtId, request).subscribe({
      next: (debt: InformalDebt) => {
        const updatedBorrowing = this.toInformalBorrowing(debt);
        this.informalBorrowings = this.informalBorrowings.map((borrowing) =>
          borrowing.id === debtId ? updatedBorrowing : borrowing
        );
        this.paybackSaving = false;
        this.selectedPaybackBorrowing = null;
        this.paybackAmount = 0;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.paybackSaving = false;
        this.paybackSaveError = this.getInformalDebtErrorMessage(error, 'payback');
        console.error('Unable to record informal debt payback.', error);
        this.changeDetector.markForCheck();
      }
    });
  }

  private toInformalBorrowing(debt: InformalDebt): InformalBorrowing {
    return {
      id: debt.debtId,
      lender: debt.lenderName,
      notes: debt.notes,
      initialAmount: debt.originalAmount,
      remainingBalance: debt.remainingBalance,
      targetRepaymentDate: debt.targetRepaymentDate
    };
  }

  private getInformalDebtErrorMessage(error: unknown, operation: 'save' | 'payback'): string {
    if (!(error instanceof HttpErrorResponse)) {
      return `An unexpected error occurred while ${operation === 'save' ? 'saving the borrowing' : 'recording the payback'}. Please try again.`;
    }

    if (error.status === 0) {
      return 'Unable to reach the API gateway. Confirm the gateway and BankingLoanService are running, then try again.';
    }

    if (error.status === 400) {
      return operation === 'save'
        ? 'Check the lender name, notes, amount, and target repayment date.'
        : 'Payback must be greater than zero and cannot exceed the remaining balance.';
    }

    if (error.status === 404) {
      return 'The borrowing was not found. Reload the page and try again.';
    }

    return `BankingLoanService could not ${operation === 'save' ? 'save the borrowing' : 'record the payback'} (HTTP ${error.status}). Check the service log for details.`;
  }

  openIncomeSourceModal(): void {
    this.incomeSourceFormValues = this.createEmptyIncomeSource();
    this.incomeSourceSaveError = '';
    this.showIncomeSourceModal = true;
  }

  closeIncomeSourceModal(): void {
    if (this.incomeSourceSaving) {
      return;
    }
    this.showIncomeSourceModal = false;
    this.incomeSourceSaveError = '';
  }

  canSaveIncomeSource(): boolean {
    const form = this.incomeSourceFormValues;
    return Boolean(
      form.name.trim() &&
      form.name.trim().length <= 100 &&
      Number.isFinite(form.amount) &&
      form.amount > 0
    );
  }

  saveIncomeSource(): void {
    const userId = this.authService.currentSession?.userId;
    if (!userId || !this.canSaveIncomeSource() || this.incomeSourceSaving) {
      return;
    }

    const request: CreateOtherIncomeRequest = {
      sourceName: this.incomeSourceFormValues.name.trim(),
      amount: this.incomeSourceFormValues.amount,
      frequency: this.incomeSourceFormValues.frequency,
      category: this.incomeSourceFormValues.category
    };
    this.incomeSourceSaving = true;
    this.incomeSourceSaveError = '';
    this.dashboardService.createOtherIncomeSource(userId, request).subscribe({
      next: (source: OtherIncomeSource) => {
        this.incomeSources = [...this.incomeSources, this.toIncomeSource(source)];
        this.incomeSourceSaving = false;
        this.showIncomeSourceModal = false;
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.incomeSourceSaving = false;
        this.incomeSourceSaveError = this.getOtherIncomeSaveErrorMessage(error);
        console.error('Unable to save income source.', error);
        this.changeDetector.markForCheck();
      }
    });
  }

  trackIncomeSource(_index: number, source: IncomeSource): string {
    return source.id;
  }

  private toIncomeSource(source: OtherIncomeSource): IncomeSource {
    return {
      id: source.incomeId,
      name: source.sourceName,
      category: source.category,
      frequency: source.frequency,
      amount: source.amount
    };
  }

  private getOtherIncomeSaveErrorMessage(error: unknown): string {
    if (!(error instanceof HttpErrorResponse)) {
      return 'An unexpected error occurred while saving the income source. Please try again.';
    }

    if (error.status === 0) {
      return 'Unable to reach the API gateway. Confirm the gateway and BankingLoanService are running, then try again.';
    }

    if (error.status === 400) {
      return 'Check the income source name, amount, frequency, and category.';
    }

    if (error.status === 404) {
      return 'The other-income API endpoint was not found. Restart BankingLoanService with the latest build.';
    }

    return `BankingLoanService could not save the income source (HTTP ${error.status}). Check the service log for details.`;
  }

  sendAssistantMessage(): void {
    const question = this.assistantPrompt.trim();
    if (!question) {
      return;
    }

    this.assistantMessages = [
      ...this.assistantMessages,
      { id: this.nextAssistantMessageId++, role: 'user', text: question },
      { id: this.nextAssistantMessageId++, role: 'assistant', text: this.createAssistantReply(question) }
    ];
    this.assistantPrompt = '';
  }

  sendAssistantMessageOnEnter(event: Event): void {
    if (!(event as KeyboardEvent).shiftKey) {
      event.preventDefault();
      this.sendAssistantMessage();
    }
  }

  clearAssistantChat(): void {
    this.assistantMessages = [];
    this.assistantPrompt = '';
  }

  trackAssistantMessage(_index: number, message: AssistantMessage): number {
    return message.id;
  }

  openHouseholdBillModal(): void {
    if (this.householdBillSaving || this.householdBillDeletingId) {
      return;
    }

    this.editingHouseholdBillId = null;
    this.householdBillFormValues = this.createEmptyHouseholdBill();
    this.householdBillsError = '';
    this.householdBillSuccessMessage = '';
    this.showHouseholdBillModal = true;
  }

  editHouseholdBill(bill: HouseholdBill): void {
    if (this.householdBillSaving || this.householdBillDeletingId) {
      return;
    }

    this.editingHouseholdBillId = bill.id;
    this.householdBillFormValues = {
      category: bill.category,
      provider: bill.provider,
      dueDate: bill.dueDate,
      amount: bill.amount
    };
    this.householdBillsError = '';
    this.householdBillSuccessMessage = '';
    this.showHouseholdBillModal = true;
  }

  closeHouseholdBillModal(): void {
    if (this.householdBillSaving) {
      return;
    }

    this.showHouseholdBillModal = false;
    this.editingHouseholdBillId = null;
    this.householdBillsError = '';
  }

  openMedicalExpenseModal(): void {
    this.medicalExpenseFormValues = this.createEmptyMedicalExpense();
    this.editingMedicalExpenseId = null;
    this.medicalExpenseSaveError = '';
    this.showMedicalExpenseModal = true;
  }

  editMedicalExpense(expense: MedicalExpense): void {
    if (this.medicalExpenseSaving || this.medicalExpenseDeletingId) {
      return;
    }

    this.editingMedicalExpenseId = expense.id;
    this.medicalExpenseFormValues = {
      serviceName: expense.serviceName,
      patientDetail: expense.patientDetail,
      billDate: expense.billDate,
      insuranceCovered: expense.insuranceCovered,
      outOfPocketDue: expense.outOfPocketDue,
      status: expense.status
    };
    this.medicalExpenseSaveError = '';
    this.showMedicalExpenseModal = true;
  }

  closeMedicalExpenseModal(): void {
    if (this.medicalExpenseSaving) {
      return;
    }
    this.showMedicalExpenseModal = false;
    this.editingMedicalExpenseId = null;
    this.medicalExpenseSaveError = '';
  }

  openMedicalClaim(expense: MedicalExpense): void {
    this.selectedMedicalClaim = expense;
  }

  closeMedicalClaim(): void {
    this.selectedMedicalClaim = null;
  }

  canSaveMedicalExpense(): boolean {
    const form = this.medicalExpenseFormValues;
    return Boolean(
      form.serviceName.trim() &&
      form.patientDetail.trim() &&
      form.billDate &&
      Number.isFinite(form.insuranceCovered) &&
      form.insuranceCovered >= 0 &&
      Number.isFinite(form.outOfPocketDue) &&
      form.outOfPocketDue >= 0 &&
      form.insuranceCovered + form.outOfPocketDue > 0
    );
  }

  saveMedicalExpense(): void {
    const userId = this.authService.currentSession?.userId;
    if (!this.canSaveMedicalExpense() || !userId || this.medicalExpenseSaving) {
      return;
    }

    const request: CreateMedicalExpenseRequest = {
      serviceName: this.medicalExpenseFormValues.serviceName.trim(),
      patientDetail: this.medicalExpenseFormValues.patientDetail.trim(),
      billDate: this.medicalExpenseFormValues.billDate,
      insuranceCovered: this.medicalExpenseFormValues.insuranceCovered,
      outOfPocketDue: this.medicalExpenseFormValues.outOfPocketDue,
      status: this.medicalExpenseFormValues.status
    };

    this.medicalExpenseSaving = true;
    this.medicalExpensesError = '';
    this.medicalExpenseSaveError = '';
    const editingId = this.editingMedicalExpenseId;
    this.medicalExpenseOperationMessage = '';
    const saveRequest = editingId
      ? this.dashboardService.updateMedicalExpense(userId, editingId, request)
      : this.dashboardService.createMedicalExpense(userId, request);
    saveRequest.subscribe({
      next: (expense: MedicalExpense) => {
        this.medicalExpenses = editingId
          ? this.medicalExpenses.map((item) => item.id === expense.id ? expense : item)
          : [expense, ...this.medicalExpenses];
        if (this.selectedMedicalClaim?.id === expense.id) {
          this.selectedMedicalClaim = expense;
        }
        this.medicalExpenseSaving = false;
        this.setMedicalExpenseOperationFeedback(
          editingId ? 'Medical expense updated successfully.' : 'Medical expense added successfully.',
          true
        );
        this.closeMedicalExpenseModal();
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.medicalExpenseSaving = false;
        this.medicalExpenseSaveError = editingId
          ? 'Unable to update this medical expense. Please try again.'
          : 'Unable to save this medical expense. Please try again.';
        this.setMedicalExpenseOperationFeedback(this.medicalExpenseSaveError, false);
        console.error(editingId ? 'Unable to update medical expense.' : 'Unable to save medical expense.', error);
        this.changeDetector.markForCheck();
      }
    });
  }

  markMedicalExpensePaid(expense: MedicalExpense): void {
    const userId = this.authService.currentSession?.userId;
    if (!userId || expense.status === 'Paid') {
      return;
    }

    const request: UpdateMedicalExpenseRequest = {
      serviceName: expense.serviceName,
      patientDetail: expense.patientDetail,
      billDate: expense.billDate,
      insuranceCovered: expense.insuranceCovered,
      outOfPocketDue: expense.outOfPocketDue,
      status: 'Paid'
    };

    this.medicalExpenseOperationMessage = '';
    this.dashboardService.updateMedicalExpense(userId, expense.id, request).subscribe({
      next: (updatedExpense: MedicalExpense) => {
        this.medicalExpenses = this.medicalExpenses.map((item) => item.id === updatedExpense.id ? updatedExpense : item);
        this.selectedMedicalClaim = updatedExpense;
        this.medicalExpensesError = '';
        this.setMedicalExpenseOperationFeedback('Medical expense marked as paid successfully.', true);
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.medicalExpensesError = 'Unable to update the medical expense. Please try again.';
        this.setMedicalExpenseOperationFeedback(this.medicalExpensesError, false);
        console.error('Unable to update medical expense.', error);
        this.changeDetector.markForCheck();
      }
    });
  }

  deleteMedicalExpense(expense: MedicalExpense): void {
    const userId = this.authService.currentSession?.userId;
    if (!userId || this.medicalExpenseDeletingId || this.medicalExpenseSaving) {
      return;
    }

    this.medicalExpenseDeletingId = expense.id;
    this.medicalExpensesError = '';
    this.medicalExpenseOperationMessage = '';
    this.dashboardService.deleteMedicalExpense(userId, expense.id).subscribe({
      next: () => {
        this.medicalExpenses = this.medicalExpenses.filter((item) => item.id !== expense.id);
        if (this.selectedMedicalClaim?.id === expense.id) {
          this.closeMedicalClaim();
        }
        this.medicalExpenseDeletingId = null;
        this.setMedicalExpenseOperationFeedback('Medical expense deleted successfully.', true);
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.medicalExpenseDeletingId = null;
        this.setMedicalExpenseOperationFeedback('Unable to delete the medical expense. Please try again.', false);
        console.error('Unable to delete medical expense.', error);
        this.changeDetector.markForCheck();
      }
    });
  }

  trackMedicalExpense(_index: number, expense: MedicalExpense): string {
    return expense.id;
  }

  private setMedicalExpenseOperationFeedback(message: string, succeeded: boolean): void {
    this.medicalExpenseOperationMessage = message;
    this.medicalExpenseOperationSucceeded = succeeded;
  }

  canSaveHouseholdBill(): boolean {
    return Boolean(
      this.householdBillFormValues.category.trim() &&
      this.householdBillFormValues.provider.trim() &&
      this.householdBillFormValues.dueDate &&
      Number.isFinite(this.householdBillFormValues.amount) &&
      this.householdBillFormValues.amount > 0
    );
  }

  saveHouseholdBill(): void {
    const userId = this.authService.currentSession?.userId;
    if (!this.canSaveHouseholdBill() || !userId || this.householdBillSaving || this.householdBillDeletingId) {
      return;
    }

    const request: CreateHouseholdBillRequest = {
      category: this.householdBillFormValues.category.trim(),
      provider: this.householdBillFormValues.provider.trim(),
      dueDate: this.householdBillFormValues.dueDate,
      amount: this.householdBillFormValues.amount,
      consumerNumber: this.editingHouseholdBillId
        ? this.householdBills.find((bill) => bill.id === this.editingHouseholdBillId)?.consumerNumber ?? ''
        : ''
    };

    this.householdBillSaving = true;
    this.householdBillsError = '';
    this.householdBillSuccessMessage = '';
    const editingBill = this.editingHouseholdBillId
      ? this.householdBills.find((bill) => bill.id === this.editingHouseholdBillId) ?? null
      : null;
    const saveRequest = this.editingHouseholdBillId
      ? this.dashboardService.updateHouseholdBill(userId, this.editingHouseholdBillId, {
        ...request,
        status: editingBill?.status ?? 'Pending'
      })
      : this.dashboardService.createHouseholdBill(userId, request);

    saveRequest.subscribe({
      next: (bill: HouseholdBill) => {
        this.householdBills = editingBill
          ? this.householdBills.map((item) => item.id === bill.id ? bill : item)
          : [bill, ...this.householdBills];
        this.dueItems = editingBill
          ? this.dueItems.map((item) =>
            item.name === editingBill.provider && item.dueDate === editingBill.dueDate
              ? { name: bill.provider, category: bill.category, dueDate: bill.dueDate, amount: bill.amount, status: bill.status }
              : item
          )
          : [
            { name: bill.provider, category: bill.category, dueDate: bill.dueDate, amount: bill.amount, status: bill.status },
            ...this.dueItems
          ].slice(0, 3);
        this.householdBillSaving = false;
        this.closeHouseholdBillModal();
        this.currentPage = 'household-bills';
        this.householdBillSuccessMessage = editingBill
          ? 'Household bill updated successfully.'
          : 'Household bill added successfully.';
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.householdBillSaving = false;
        this.householdBillsError = editingBill
          ? 'Unable to update this household bill. Please try again.'
          : 'Unable to save this household bill. Please try again.';
        console.error(editingBill ? 'Unable to update household bill.' : 'Unable to save household bill.', error);
        this.changeDetector.markForCheck();
      }
    });
  }

  markBillPaid(bill: HouseholdBill): void {
    const userId = this.authService.currentSession?.userId;
    if (!userId) {
      return;
    }

    const request: UpdateHouseholdBillRequest = { ...bill, status: 'Paid' };
    this.dashboardService.updateHouseholdBill(userId, bill.id, request).subscribe({
      next: (updatedBill: HouseholdBill) => {
        this.householdBills = this.householdBills.map((item) => item.id === updatedBill.id ? updatedBill : item);
        this.dueItems = this.dueItems.map((item) =>
          item.name === bill.provider && item.dueDate === bill.dueDate
            ? { ...item, status: updatedBill.status }
            : item
        );
        this.householdBillsError = '';
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.householdBillsError = 'Unable to update the bill payment status. Please try again.';
        console.error('Unable to update household bill.', error);
        this.changeDetector.markForCheck();
      }
    });
  }

  deleteHouseholdBill(bill: HouseholdBill): void {
    const userId = this.authService.currentSession?.userId;
    if (!userId || this.householdBillSaving || this.householdBillDeletingId) {
      return;
    }

    this.householdBillDeletingId = bill.id;
    this.householdBillsError = '';
    this.dashboardService.deleteHouseholdBill(userId, bill.id).subscribe({
      next: () => {
        this.householdBills = this.householdBills.filter((item) => item.id !== bill.id);
        this.dueItems = this.dueItems.filter((item) => !(item.name === bill.provider && item.dueDate === bill.dueDate));
        this.householdBillDeletingId = null;
        this.householdBillsError = '';
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.householdBillDeletingId = null;
        this.householdBillsError = 'Unable to delete the household bill. Please try again.';
        console.error('Unable to delete household bill.', error);
        this.changeDetector.markForCheck();
      }
    });
  }

  trackBill(_index: number, bill: HouseholdBill): string {
    return bill.id;
  }

  canSaveBankAccount(): boolean {
    return Boolean(
      this.bankAccountFormValues.bankName.trim() &&
      /^[0-9]{4}$/.test(this.bankAccountFormValues.lastFour) &&
      this.bankAccountFormValues.ifsc.trim() &&
      Number.isFinite(this.bankAccountFormValues.balance) &&
      this.bankAccountFormValues.balance >= 0
    );
  }

  saveBankAccount(): void {
    const userId = this.authService.currentSession?.userId;
    if (!this.canSaveBankAccount() || !userId || this.bankAccountSaving) {
      return;
    }

    const request: CreateBankAccountRequest = {
      ...this.bankAccountFormValues,
      bankName: this.bankAccountFormValues.bankName.trim(),
      lastFour: this.bankAccountFormValues.lastFour.trim(),
      ifsc: this.bankAccountFormValues.ifsc.trim().toUpperCase()
    };

    const editingBankAccountId = this.editingBankAccountId;
    this.bankAccountSaving = true;
    this.bankAccountSaveError = '';
    const saveRequest = editingBankAccountId
      ? this.dashboardService.updateBankAccount(userId, editingBankAccountId, request)
      : this.dashboardService.createBankAccount(userId, request);
    saveRequest.subscribe({
      next: (account: BankAccount) => {
        this.bankAccounts = editingBankAccountId
          ? this.bankAccounts.map((item) => item.bankAccountId === account.bankAccountId ? account : item)
          : [account, ...this.bankAccounts];
        this.bankAccountsError = '';
        this.bankAccountSaving = false;
        this.closeBankAccountModal();
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.bankAccountSaving = false;
        this.bankAccountSaveError = editingBankAccountId
          ? 'Unable to update this bank account. Please try again.'
          : 'Unable to save this bank account. Please try again.';
        console.error(editingBankAccountId ? 'Unable to update bank account.' : 'Unable to save bank account.', error);
        this.changeDetector.markForCheck();
      }
    });
  }

  deleteBankAccount(account: BankAccount): void {
    const userId = this.authService.currentSession?.userId;
    if (!userId || this.bankAccountSaving || this.bankAccountDeletingId) {
      return;
    }

    this.bankAccountDeletingId = account.bankAccountId;
    this.bankAccountsError = '';
    this.dashboardService.deleteBankAccount(userId, account.bankAccountId).subscribe({
      next: () => {
        this.bankAccounts = this.bankAccounts.filter((item) => item.bankAccountId !== account.bankAccountId);
        this.bankAccountDeletingId = null;
        this.bankAccountsError = '';
        this.changeDetector.markForCheck();
      },
      error: (error: unknown) => {
        this.bankAccountDeletingId = null;
        this.bankAccountsError = error instanceof HttpErrorResponse && error.status === 409
          ? 'This account cannot be deleted while it has debit transactions.'
          : 'Unable to delete the bank account. Please try again.';
        console.error('Unable to delete bank account.', error);
        this.changeDetector.markForCheck();
      }
    });
  }

  saveEntry(): void {
    if (
      !this.entryFormValues.name.trim() ||
      !this.entryFormValues.category.trim() ||
      !Number.isFinite(this.entryFormValues.amount) ||
      this.entryFormValues.amount <= 0 ||
      !this.entryFormValues.dueDate
    ) {
      return;
    }

    const entry: DueItem = {
      name: this.entryFormValues.name.trim(),
      amount: this.entryFormValues.amount,
      category: this.entryFormValues.category.trim(),
      dueDate: this.entryFormValues.dueDate,
      status: 'Pending'
    };

    this.manuallyAddedItems.unshift(entry);
    this.dueItems = [entry, ...this.dueItems.filter((item) => !this.manuallyAddedItems.slice(1).includes(item))];
    this.closeEntryModal();
  }

  private createEmptyEntry(): EntryForm {
    return {
      name: '',
      amount: 0,
      category: '',
      dueDate: ''
    };
  }

  private createEmptyBankAccount(): BankAccountForm {
    return {
      bankName: '',
      accountType: 'Checking Account',
      lastFour: '',
      balance: 0,
      ifsc: ''
    };
  }

  private createEmptyCreditCard(): CreditCardForm {
    return {
      name: '',
      statementBalance: 0,
      minimumDue: 0,
      dueDate: '',
      creditLimit: 0
    };
  }

  private createEmptyDebitTransaction(): DebitTransactionForm {
    return {
      date: '',
      accountId: '',
      merchant: '',
      amount: 0,
      category: ''
    };
  }

  private createEmptyBankLoan(): BankLoanForm {
    return {
      lender: '',
      type: 'Home Loan',
      interestRate: 0,
      monthlyEmi: 0,
      principalRemaining: 0,
      yearsRemaining: 0
    };
  }

  private createEmptyAppLoan(): AppLoanForm {
    return {
      appName: '',
      type: 'App Loan',
      outstandingBalance: 0,
      nextEmi: 0,
      dueDate: ''
    };
  }

  private createEmptyBorrowing(): InformalBorrowingForm {
    return {
      lender: '',
      notes: '',
      initialAmount: 0,
      targetRepaymentDate: ''
    };
  }

  private createEmptyIncomeSource(): IncomeSourceForm {
    return {
      name: '',
      category: 'Side Hustle',
      frequency: 'Monthly',
      amount: 0
    };
  }

  private createAssistantReply(question: string): string {
    const normalizedQuestion = question.toLowerCase();

    if (/(bill|due|upcoming|obligation)/.test(normalizedQuestion)) {
      const pendingBills = this.dueItems.filter((item) => item.status !== 'Paid');
      const total = pendingBills.reduce((sum, item) => sum + item.amount, 0);
      if (pendingBills.length === 0) {
        return 'There are no unpaid upcoming bills in the data currently shown.';
      }

      const list = pendingBills
        .map((item) => `${item.name}: ${item.amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} due ${item.dueDate}`)
        .join('; ');
      return `The dashboard currently shows ${pendingBills.length} unpaid items totaling ${total.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}: ${list}. Check each provider for the latest amount and due date.`;
    }

    if (/(net worth|liquid|balance|cash)/.test(normalizedQuestion)) {
      const bankBalance = this.bankAccounts.reduce((sum, account) => sum + account.balance, 0);
      const knownDebt = this.bankLoans.reduce((sum, loan) => sum + loan.principalRemaining, 0)
        + this.appLoans.reduce((sum, loan) => sum + loan.outstandingBalance, 0)
        + this.informalBorrowings.reduce((sum, borrowing) => sum + borrowing.remainingBalance, 0)
        + this.creditCards.reduce((sum, card) => sum + card.statementBalance, 0);
      const estimate = bankBalance - knownDebt;
      return `Based on the sample records currently loaded, bank accounts total ${bankBalance.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} and listed debts total ${knownDebt.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}. That gives an estimated net position of ${estimate.toLocaleString('en-US', { style: 'currency', currency: 'USD' })}, before any assets or liabilities not tracked here.`;
    }

    if (/(loan|debt|repay|payoff|interest)/.test(normalizedQuestion)) {
      const highestInterestLoan = [...this.bankLoans].sort((a, b) => b.interestRate - a.interestRate)[0];
      if (!highestInterestLoan) {
        return 'No bank loan details are available to compare in the current dashboard data. Consider prioritizing high-interest debt while keeping required payments current and maintaining an emergency reserve.';
      }

      return `A common payoff approach is to keep every required payment current, then direct extra payments toward the highest-interest debt while preserving an emergency reserve. Your listed bank loan with the highest rate is ${highestInterestLoan.lender} at ${highestInterestLoan.interestRate}% (${highestInterestLoan.principalRemaining.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} remaining). Check your lender's terms for prepayment fees before making extra payments.`;
    }

    return 'I can summarize the sample bills, estimate a net position from the records shown, or help compare loan repayment priorities. This demo uses local rules rather than a connected AI model, so please verify important financial decisions with your provider or a qualified advisor.';
  }

  private createEmptyHouseholdBill(): HouseholdBillForm {
    return {
      category: '',
      provider: '',
      dueDate: '',
      amount: 0
    };
  }

  private createEmptyMedicalExpense(): MedicalExpenseForm {
    return {
      serviceName: '',
      patientDetail: '',
      billDate: '',
      insuranceCovered: 0,
      outOfPocketDue: 0,
      status: 'Pending'
    };
  }
}
