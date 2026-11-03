export interface BillSummary {
  category: string;
  provider: string;
  amount: number;
  dueDate: string;
  status: 'Pending' | 'Paid' | 'Overdue';
}

export interface HouseholdBill extends BillSummary {
  id: string;
  consumerNumber: string;
}

export interface CreateHouseholdBillRequest {
  category: string;
  provider: string;
  consumerNumber: string;
  amount: number;
  dueDate: string;
}

export interface UpdateHouseholdBillRequest extends CreateHouseholdBillRequest {
  status: HouseholdBill['status'];
}

export interface LoanSummary {
  type: string;
  lender: string;
  principal: number;
  outstanding: number;
  emi: number;
}

export interface BankAccount {
  bankAccountId: string;
  userId: string;
  bankName: string;
  accountType: string;
  lastFour: string;
  balance: number;
  ifsc: string;
  createdAt: string;
}

export interface CreateBankAccountRequest {
  bankName: string;
  accountType: string;
  lastFour: string;
  balance: number;
  ifsc: string;
}

export type UpdateBankAccountRequest = CreateBankAccountRequest;

export interface CreditCardStatement {
  cardId: string;
  userId: string;
  issuerName: string;
  statementBalance: number;
  minimumDue: number;
  dueDate: string;
  creditLimit: number;
}

export type CreateCreditCardStatementRequest = Omit<CreditCardStatement, 'cardId' | 'userId'>;
export type UpdateCreditCardStatementRequest = CreateCreditCardStatementRequest;

export interface DebitTransaction {
  transactionId: string;
  userId: string;
  accountId: string;
  bankAccount: string;
  transactionDate: string;
  merchantName: string;
  amount: number;
  category: string;
}

export type CreateDebitTransactionRequest = Omit<DebitTransaction, 'transactionId' | 'userId' | 'bankAccount'>;
export type UpdateDebitTransactionRequest = CreateDebitTransactionRequest;

export interface ThirdPartyLoan {
  loanId: string;
  userId: string;
  appName: string;
  type: 'App Loan' | 'PayLater';
  outstandingBalance: number;
  nextEmi: number;
  dueDate: string;
}

export type CreateThirdPartyLoanRequest = Omit<ThirdPartyLoan, 'loanId' | 'userId'>;
export type UpdateThirdPartyLoanRequest = CreateThirdPartyLoanRequest;

export interface InformalDebt {
  debtId: string;
  userId: string;
  lenderName: string;
  notes: string;
  originalAmount: number;
  remainingBalance: number;
  targetRepaymentDate: string;
}

export type CreateInformalDebtRequest = Omit<InformalDebt, 'debtId' | 'userId' | 'remainingBalance'>;

export interface RecordInformalDebtPaybackRequest {
  amount: number;
}

export interface OtherIncomeSource {
  incomeId: string;
  userId: string;
  sourceName: string;
  amount: number;
  frequency: string;
  category: string;
}

export type CreateOtherIncomeRequest = Omit<OtherIncomeSource, 'incomeId' | 'userId'>;

export interface BankLoan {
  loanId: string;
  userId: string;
  lender: string;
  type: 'Home Loan' | 'Personal Loan' | 'Vehicle Loan' | 'Other';
  interestRate: number;
  monthlyEmi: number;
  principalRemaining: number;
  yearsRemaining: number;
  createdAt: string;
}

export type CreateBankLoanRequest = Omit<BankLoan, 'loanId' | 'userId' | 'createdAt'>;
export type UpdateBankLoanRequest = CreateBankLoanRequest;

export interface CreditScoreReport {
  userId: string;
  bureauName: string;
  creditScore: number;
  reportDate: string;
  summaryNotes: string;
}

export interface MedicalExpenseSummary {
  id: string;
  userId: string;
  serviceName: string;
  patientDetail: string;
  billDate: string;
  insuranceCovered: number;
  outOfPocketDue: number;
  status: 'Paid' | 'Pending';
}

export type CreateMedicalExpenseRequest = Omit<MedicalExpenseSummary, 'id' | 'userId'>;
export type UpdateMedicalExpenseRequest = CreateMedicalExpenseRequest;