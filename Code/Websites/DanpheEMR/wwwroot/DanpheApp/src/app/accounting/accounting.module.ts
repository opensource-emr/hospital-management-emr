import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule, HttpClientJsonpModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
// import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { AccountingSettingsModule } from './settings/accounting-settings.module';

import { AccountingDLService } from './shared/accounting.dl.service';
import { AccountingBLService } from './shared/accounting.bl.service';

import { AccountingRoutingModule } from './accounting-routing.module';
import { AccountingComponent } from './accounting.component';
import { VoucherEntryComponent } from './transactions/voucher-entry.component';
import { TransactionsMainComponent } from './transactions/transactions-main.component';
import { AccountingSharedModule } from "./shared/accounting-shared.module";
import { AccountClosureComponent } from './transactions/account-closure.component';
import { TransferToAccountingComponent } from "./transactions/transfer-to-accounting.component";
import { SharedModule } from '../shared/shared.module';
import { AccountingSyncBaseComponent } from './sync/accounting-sync-base.component';
import { LedgersAddReusableComponent } from './transactions/shared/create-ledger-reusable/ledger-add-reusable.component';
import { LedgerGroupAddReusableComponent } from './transactions/shared/create-ledger-group-reusable/ledger-group-add-reusable.component';
import { LoaderComponent } from '../shared/danphe-loader-intercepter/danphe-loader';
import { ManualVoucherEditComponent } from './transactions/manual-voucher-edit.component'
import { ActivateAccountingHospitalComponent } from './activate-hospital/accounting-hospital-activate.component';
import { AccHospitalSelectionGuardService } from './shared/hospital-selection.guard';
import { AccountingReportsComponent } from './reports/accounting-reports.component';
import { BalanceSheetReportComponent } from './reports/balance-sheet/balance-sheet-report.component';
import { LedgerReportComponent } from './reports/ledger-report/ledger-report.component';
import { VoucherReportComponent } from './reports/voucher-report/voucher-report.component';
import { TrailBalanceReportComponent } from './reports/trail-balance/trail-balance.component';
import { ProfitLossReportComponent } from './reports/profit-loss/profit-loss-report.component';
import { DailyTransactionReportComponent } from './reports/daily-transaction/daily-transaction-report.component';
import { CashFlowReportComponent } from './reports/Cash-Flow/cash-flow-report.component';
import { DaywiseVoucherReportComponent } from './reports/daywise-voucher-report/daywise-voucher-report.component';
import { SystemAuditReportComponent } from './reports/system-audit/system-audit-report.component';
import { GroupStatementReportComponent } from './reports/group-statement-report/group-statement-report.component';
import { LedgerReportResuableComponent } from './reports/shared/ledger-report-reusable/ledger-report-reusable.component';
import { CustomDateReusableComponent } from './reports/shared/custom-date-reusable/custom-date-reusable.component';
import { DaywiseVoucherDetailsComponent } from './reports/daywise-voucher-report/daywise-voucher-details.component';
import { AccountingReportsBLService } from './reports/shared/accounting-reports.bl.service';
import { AccountingReportsDLService } from './reports/shared/accounting-reports.dl.service';
import { BankReconciliationComponent } from './reports/bank-reconciliation/bank-reconciliation.component';
import {PaymentComponent  } from './transactions/payment/account-payment.component';
@NgModule({
  providers: [AccountingDLService, AccountingBLService,AccountingReportsBLService, AccountingReportsDLService,AccHospitalSelectionGuardService,
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
    LedgersAddReusableComponent,
    LedgerGroupAddReusableComponent,
    ManualVoucherEditComponent,
    ActivateAccountingHospitalComponent,
    PaymentComponent
  ],
  bootstrap: []
})
export class AccountingModule { }
