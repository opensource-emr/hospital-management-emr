import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { DanpheAutoCompleteModule } from'../../shared/danphe-autocomplete/danphe-auto-complete.module';
import { AccountingReportsRoutingModule } from './accounting-reports-routing.module';
import { AccountingReportsComponent } from './accounting-reports.component';
import { AccountingReportsBLService } from './shared/accounting-reports.bl.service';
import { AccountingReportsDLService } from './shared/accounting-reports.dl.service';
import { BalanceSheetReportComponent } from './balance-sheet/balance-sheet-report.component';
import { LedgerReportComponent } from './ledger-report/ledger-report.component';
import { VoucherReportComponent } from './voucher-report/voucher-report.component';
import { AccountingSharedModule } from "../shared/accounting-shared.module";
import { TrailBalanceReportComponent } from './trail-balance/trail-balance.component';
import { ProfitLossReportComponent } from './profit-loss/profit-loss-report.component';
import { DailyTransactionReportComponent } from './daily-transaction/daily-transaction-report.component';
import { CashFlowReportComponent } from './Cash-Flow/cash-flow-report.component';
import { LedgerReportResuableComponent } from './shared/ledger-report-reusable/ledger-report-reusable.component';
import { CustomDateReusableComponent } from "./shared/custom-date-reusable/custom-date-reusable.component";
import { DaywiseVoucherReportComponent } from './daywise-voucher-report/daywise-voucher-report.component';
import { DaywiseVoucherDetailsComponent} from "./daywise-voucher-report/daywise-voucher-details.component";
import { SystemAuditReportComponent } from './system-audit/system-audit-report.component';
@NgModule({
    providers: [AccountingReportsBLService, AccountingReportsDLService, { provide: LocationStrategy, useClass: HashLocationStrategy }],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        DanpheAutoCompleteModule,
        AccountingReportsRoutingModule,
        AccountingSharedModule],
    declarations: [
        AccountingReportsComponent,
        BalanceSheetReportComponent,
        LedgerReportComponent,
        VoucherReportComponent,
        TrailBalanceReportComponent,
        ProfitLossReportComponent,
        DailyTransactionReportComponent,
        CashFlowReportComponent,
      LedgerReportResuableComponent,
      CustomDateReusableComponent,
      DaywiseVoucherReportComponent,
      DaywiseVoucherDetailsComponent,SystemAuditReportComponent
    ],

    bootstrap: [AccountingReportsComponent]
})
export class AccountingReportsModule { }
