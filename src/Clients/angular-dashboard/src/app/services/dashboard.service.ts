import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BankAccount, BankLoan, CreateBankAccountRequest, CreateBankLoanRequest, CreateCreditCardStatementRequest, CreateDebitTransactionRequest, CreateHouseholdBillRequest, CreateInformalDebtRequest, CreateMedicalExpenseRequest, CreateOtherIncomeRequest, CreateThirdPartyLoanRequest, CreditCardStatement, CreditScoreReport, DebitTransaction, HouseholdBill, InformalDebt, LoanSummary, MedicalExpenseSummary, OtherIncomeSource, RecordInformalDebtPaybackRequest, ThirdPartyLoan, UpdateBankAccountRequest, UpdateBankLoanRequest, UpdateCreditCardStatementRequest, UpdateDebitTransactionRequest, UpdateHouseholdBillRequest, UpdateMedicalExpenseRequest, UpdateThirdPartyLoanRequest } from '../models/finance.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private http = inject(HttpClient);
  private gatewayUrl = '/gateway';

  getHouseholdBills(userId: string): Observable<HouseholdBill[]> {
    return this.http.get<HouseholdBill[]>(`${this.gatewayUrl}/household/bills/user/${userId}`);
  }

  createHouseholdBill(userId: string, bill: CreateHouseholdBillRequest): Observable<HouseholdBill> {
    return this.http.post<HouseholdBill>(`${this.gatewayUrl}/household/bills/user/${userId}`, bill);
  }

  updateHouseholdBill(userId: string, billId: string, bill: UpdateHouseholdBillRequest): Observable<HouseholdBill> {
    return this.http.put<HouseholdBill>(`${this.gatewayUrl}/household/bills/${billId}/user/${userId}`, bill);
  }

  deleteHouseholdBill(userId: string, billId: string): Observable<void> {
    return this.http.delete<void>(`${this.gatewayUrl}/household/bills/${billId}/user/${userId}`);
  }

  getBankingAndLoans(userId: string): Observable<any> {
    return this.http.get<any>(`${this.gatewayUrl}/banking/dashboardsummary/user/${userId}`);
  }

  getBankAccounts(userId: string): Observable<BankAccount[]> {
    return this.http.get<BankAccount[]>(`${this.gatewayUrl}/banking/bankaccounts/user/${userId}`);
  }

  createBankAccount(userId: string, account: CreateBankAccountRequest): Observable<BankAccount> {
    return this.http.post<BankAccount>(`${this.gatewayUrl}/banking/bankaccounts/user/${userId}`, account);
  }

  updateBankAccount(userId: string, bankAccountId: string, account: UpdateBankAccountRequest): Observable<BankAccount> {
    return this.http.put<BankAccount>(`${this.gatewayUrl}/banking/bankaccounts/${bankAccountId}/user/${userId}`, account);
  }

  deleteBankAccount(userId: string, bankAccountId: string): Observable<void> {
    return this.http.delete<void>(`${this.gatewayUrl}/banking/bankaccounts/${bankAccountId}/user/${userId}`);
  }

  getCreditCardStatements(userId: string): Observable<CreditCardStatement[]> {
    return this.http.get<CreditCardStatement[]>(`${this.gatewayUrl}/banking/creditcardstatements/user/${userId}`);
  }

  createCreditCardStatement(userId: string, statement: CreateCreditCardStatementRequest): Observable<CreditCardStatement> {
    return this.http.post<CreditCardStatement>(`${this.gatewayUrl}/banking/creditcardstatements/user/${userId}`, statement);
  }

  updateCreditCardStatement(userId: string, cardId: string, statement: UpdateCreditCardStatementRequest): Observable<CreditCardStatement> {
    return this.http.put<CreditCardStatement>(`${this.gatewayUrl}/banking/creditcardstatements/${cardId}/user/${userId}`, statement);
  }

  deleteCreditCardStatement(userId: string, cardId: string): Observable<void> {
    return this.http.delete<void>(`${this.gatewayUrl}/banking/creditcardstatements/${cardId}/user/${userId}`);
  }

  getDebitTransactions(userId: string): Observable<DebitTransaction[]> {
    return this.http.get<DebitTransaction[]>(`${this.gatewayUrl}/banking/debittransactions/user/${userId}`);
  }

  createDebitTransaction(userId: string, transaction: CreateDebitTransactionRequest): Observable<DebitTransaction> {
    return this.http.post<DebitTransaction>(`${this.gatewayUrl}/banking/debittransactions/user/${userId}`, transaction);
  }

  updateDebitTransaction(userId: string, transactionId: string, transaction: UpdateDebitTransactionRequest): Observable<DebitTransaction> {
    return this.http.put<DebitTransaction>(`${this.gatewayUrl}/banking/debittransactions/${transactionId}/user/${userId}`, transaction);
  }

  deleteDebitTransaction(userId: string, transactionId: string): Observable<void> {
    return this.http.delete<void>(`${this.gatewayUrl}/banking/debittransactions/${transactionId}/user/${userId}`);
  }

  getThirdPartyLoans(userId: string): Observable<ThirdPartyLoan[]> {
    return this.http.get<ThirdPartyLoan[]>(`${this.gatewayUrl}/banking/thirdpartyloans/user/${userId}`);
  }

  createThirdPartyLoan(userId: string, loan: CreateThirdPartyLoanRequest): Observable<ThirdPartyLoan> {
    return this.http.post<ThirdPartyLoan>(`${this.gatewayUrl}/banking/thirdpartyloans/user/${userId}`, loan);
  }

  updateThirdPartyLoan(userId: string, loanId: string, loan: UpdateThirdPartyLoanRequest): Observable<ThirdPartyLoan> {
    return this.http.put<ThirdPartyLoan>(`${this.gatewayUrl}/banking/thirdpartyloans/${loanId}/user/${userId}`, loan);
  }

  deleteThirdPartyLoan(userId: string, loanId: string): Observable<void> {
    return this.http.delete<void>(`${this.gatewayUrl}/banking/thirdpartyloans/${loanId}/user/${userId}`);
  }

  getInformalDebts(userId: string): Observable<InformalDebt[]> {
    return this.http.get<InformalDebt[]>(`${this.gatewayUrl}/banking/informaldebts/user/${userId}`);
  }

  createInformalDebt(userId: string, debt: CreateInformalDebtRequest): Observable<InformalDebt> {
    return this.http.post<InformalDebt>(`${this.gatewayUrl}/banking/informaldebts/user/${userId}`, debt);
  }

  recordInformalDebtPayback(
    userId: string,
    debtId: string,
    request: RecordInformalDebtPaybackRequest
  ): Observable<InformalDebt> {
    return this.http.post<InformalDebt>(
      `${this.gatewayUrl}/banking/informaldebts/${debtId}/user/${userId}/paybacks`,
      request
    );
  }

  getOtherIncomeSources(userId: string): Observable<OtherIncomeSource[]> {
    return this.http.get<OtherIncomeSource[]>(`${this.gatewayUrl}/banking/otherincome/user/${userId}`);
  }

  createOtherIncomeSource(userId: string, source: CreateOtherIncomeRequest): Observable<OtherIncomeSource> {
    return this.http.post<OtherIncomeSource>(`${this.gatewayUrl}/banking/otherincome/user/${userId}`, source);
  }

  getBankLoans(userId: string): Observable<BankLoan[]> {
    return this.http.get<BankLoan[]>(`${this.gatewayUrl}/banking/bankloans/user/${userId}`);
  }

  createBankLoan(userId: string, loan: CreateBankLoanRequest): Observable<BankLoan> {
    return this.http.post<BankLoan>(`${this.gatewayUrl}/banking/bankloans/user/${userId}`, loan);
  }

  updateBankLoan(userId: string, loanId: string, loan: UpdateBankLoanRequest): Observable<BankLoan> {
    return this.http.put<BankLoan>(`${this.gatewayUrl}/banking/bankloans/${loanId}/user/${userId}`, loan);
  }

  deleteBankLoan(userId: string, loanId: string): Observable<void> {
    return this.http.delete<void>(`${this.gatewayUrl}/banking/bankloans/${loanId}/user/${userId}`);
  }

  getCreditScore(userId: string): Observable<CreditScoreReport> {
    return this.http.get<CreditScoreReport>(`${this.gatewayUrl}/creditscore/user/${userId}`);
  }

  getMedicalExpenses(userId: string): Observable<MedicalExpenseSummary[]> {
    return this.http.get<MedicalExpenseSummary[]>(`${this.gatewayUrl}/banking/medicalexpenses/user/${userId}`);
  }

  createMedicalExpense(userId: string, expense: CreateMedicalExpenseRequest): Observable<MedicalExpenseSummary> {
    return this.http.post<MedicalExpenseSummary>(`${this.gatewayUrl}/banking/medicalexpenses/user/${userId}`, expense);
  }

  updateMedicalExpense(userId: string, expenseId: string, expense: UpdateMedicalExpenseRequest): Observable<MedicalExpenseSummary> {
    return this.http.put<MedicalExpenseSummary>(`${this.gatewayUrl}/banking/medicalexpenses/${expenseId}/user/${userId}`, expense);
  }

  deleteMedicalExpense(userId: string, expenseId: string): Observable<void> {
    return this.http.delete<void>(`${this.gatewayUrl}/banking/medicalexpenses/${expenseId}/user/${userId}`);
  }
}