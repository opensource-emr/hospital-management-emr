import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { AccountingReportsComponent } from './accounting-reports.component';
import { BalanceSheetReportComponent } from './balance-sheet/balance-sheet-report.component';
import { VoucherReportComponent } from './voucher-report/voucher-report.component';
import { LedgerReportComponent } from './ledger-report/ledger-report.component';
import { TrailBalanceReportComponent } from './trail-balance/trail-balance.component';
import { ProfitLossReportComponent } from './profit-loss/profit-loss-report.component';
import { DailyTransactionReportComponent } from './daily-transaction/daily-transaction-report.component';
import { CashFlowReportComponent } from './Cash-Flow/cash-flow-report.component';
import { DaywiseVoucherReportComponent } from './daywise-voucher-report/daywise-voucher-report.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: AccountingReportsComponent
            },
            { path: 'BalanceSheetReport', component: BalanceSheetReportComponent },
            { path: 'LedgerReport', component: LedgerReportComponent },
            { path: 'VoucherReport', component: VoucherReportComponent },
            { path: 'TrailBalanceReport', component: TrailBalanceReportComponent },
            { path: 'ProfitLossReport', component: ProfitLossReportComponent },
            { path: 'DailyTransactionReport', component: DailyTransactionReportComponent },
            { path: 'CashFlowReport', component: CashFlowReportComponent },
            { path: 'DaywiseVoucherReport', component: DaywiseVoucherReportComponent }
        ])
    ],
    exports: [
        RouterModule
    ]
})

export class AccountingReportsRoutingModule {

}