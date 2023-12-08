import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
// import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { AccountingSettingsModule } from './settings/accounting-settings.module';

import { AccountingBLService } from './shared/accounting.bl.service';
import { AccountingDLService } from './shared/accounting.dl.service';

import { DepartmentSettingsModule } from '../settings-new/departments/dept-settings.module';
import { EmpSettingsModule } from '../settings-new/employee/emp-settings.module';
import { AccountingRoutingModule } from './accounting-routing.module';
import { AccountingComponent } from './accounting.component';
import { ActivateAccountingHospitalComponent } from './activate-hospital/accounting-hospital-activate.component';
import { BankReconciliationMainComponent } from './bank-reconciliation/bank-reconciliation-main.component';
import { BankReconciliationComponent } from './bank-reconciliation/reconcile-bank-transactions/bank-reconciliation.component';
import { SuspenseAccountReconciliationComponent } from './bank-reconciliation/reconcile-suspense-account/suspense-reconciliation.component';
import { CashFlowReportComponent } from './reports/Cash-Flow/cash-flow-report.component';
import { DayBookReportComponent } from './reports/Day-Book-Report/day-book-report.component';
import { AccountHeadDetailReportComponent } from './reports/account-head-detail-report/account-head-detail-report.component';
import { AccountingReportsComponent } from './reports/accounting-reports.component';
import { BalanceSheetReportComponent } from './reports/balance-sheet/balance-sheet-report.component';
import { CashBankBookReportComponent } from './reports/cash-bank-book-report/cash-bank-book-report.component';
import { DailyTransactionReportComponent } from './reports/daily-transaction/daily-transaction-report.component';
import { DaywiseVoucherDetailsComponent } from './reports/daywise-voucher-report/daywise-voucher-details.component';
import { DaywiseVoucherReportComponent } from './reports/daywise-voucher-report/daywise-voucher-report.component';
import { GroupStatementReportComponent } from './reports/group-statement-report/group-statement-report.component';
import { LedgerReportComponent } from './reports/ledger-report/ledger-report.component';
import { ProfitLossReportComponent } from './reports/profit-loss/profit-loss-report.component';
import { AccountingReportsBLService } from './reports/shared/accounting-reports.bl.service';
import { AccountingReportsDLService } from './reports/shared/accounting-reports.dl.service';
import { CustomDateReusableComponent } from './reports/shared/custom-date-reusable/custom-date-reusable.component';
import { LedgerReportResuableComponent } from './reports/shared/ledger-report-reusable/ledger-report-reusable.component';
import { SubLedgerReportComponent } from './reports/subledger-report/subledger-report.component';
import { SystemAuditReportComponent } from './reports/system-audit/system-audit-report.component';
import { TrailBalanceReportComponent } from './reports/trail-balance/trail-balance.component';
import { VoucherReportComponent } from './reports/voucher-report/voucher-report.component';
import { AccountingSharedModule } from "./shared/accounting-shared.module";
import { AccHospitalSelectionGuardService } from './shared/hospital-selection.guard';
import { AccountingSyncBaseComponent } from './sync/accounting-sync-base.component';
import { AccountClosureComponent } from './transactions/account-closure.component';
import { ManualVoucherEditComponent } from './transactions/manual-voucher-edit.component';
import { PaymentComponent } from './transactions/payment/account-payment.component';
import { SubLedgerAddComponent } from './transactions/shared/create-subledger/subledger-add.component';
import { TransactionsMainComponent } from './transactions/transactions-main.component';
import { TransferToAccountingComponent } from "./transactions/transfer-to-accounting.component";
import { VoucherEntryComponent } from './transactions/voucher-entry.component';
import { VoucherVerificationComponent } from './voucher-verification/voucher-verification.component';
@NgModule({
  providers: [AccountingDLService, AccountingBLService, AccountingReportsBLService, AccountingReportsDLService, AccHospitalSelectionGuardService,
    { provide: LocationStrategy, useClass: HashLocationStrategy }],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    DanpheAutoCompleteModule,
    AccountingSharedModule,
    AccountingRoutingModule,
    AccountingSettingsModule,
    DepartmentSettingsModule,
    EmpSettingsModule,


  ],
  declarations: [
    // START: mumbai-team-june2021-danphe-accounting-cache-change*
    AccountingReportsComponent,
    BalanceSheetReportComponent,
    LedgerReportComponent,
    VoucherReportComponent,
    TrailBalanceReportComponent,
    ProfitLossReportComponent,
    DailyTransactionReportComponent,
    CashFlowReportComponent,
    BankReconciliationComponent,
    LedgerReportResuableComponent,
    CustomDateReusableComponent,
    DaywiseVoucherReportComponent,
    DaywiseVoucherDetailsComponent,
    SystemAuditReportComponent,
    GroupStatementReportComponent,
    // END: mumbai-team-june2021-danphe-accounting-cache-change*
    AccountingComponent,
    TransactionsMainComponent,
    VoucherEntryComponent,
    AccountClosureComponent,
    TransferToAccountingComponent,
    AccountingSyncBaseComponent,
    ManualVoucherEditComponent,
    ActivateAccountingHospitalComponent,
    PaymentComponent,
    CashBankBookReportComponent,
    DayBookReportComponent,
    SubLedgerReportComponent,
    VoucherVerificationComponent,
    BankReconciliationMainComponent,
    SuspenseAccountReconciliationComponent,
    SubLedgerAddComponent,
    AccountHeadDetailReportComponent
  ],
  bootstrap: []
})
export class AccountingModule { }
