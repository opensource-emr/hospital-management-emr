import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";

import { AccountingComponent } from './accounting.component';
import { TransactionsMainComponent } from './transactions/transactions-main.component';
import { VoucherEntryComponent } from './transactions/voucher-entry.component';
import { AccountClosureComponent } from './transactions/account-closure.component';
import { TransferToAccountingComponent } from "./transactions/transfer-to-accounting.component";
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { ManualVoucherEditComponent } from './transactions/manual-voucher-edit.component';
import { ResetAccountingServiceGuard } from './shared/reset-accounting-service-guard';
import { PageNotFound } from '../404-error/404-not-found.component';
import { AccHospitalSelectionGuardService } from './shared/hospital-selection.guard';
import { ActivateAccountingHospitalComponent } from './activate-hospital/accounting-hospital-activate.component';
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
import { BankReconciliationComponent } from './reports/bank-reconciliation/bank-reconciliation.component';
import {PaymentComponent} from './transactions/payment/account-payment.component';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '', component: AccountingComponent, canActivate: [AuthGuardService],
                children: [
                    { path: '', redirectTo: 'Transaction/ActivateHospital', pathMatch: 'full' },
                    {

                        path: 'Transaction', component: TransactionsMainComponent, canActivate: [AuthGuardService],
                        children: [
                            { path: '', redirectTo: 'VoucherEntry', pathMatch: 'full' },
                            { path: 'VoucherEntry', component: VoucherEntryComponent, canActivate: [AuthGuardService] },
                            { path: 'TransferToACC', component: TransferToAccountingComponent, canActivate: [AuthGuardService] },
                            //{ path: 'Sync', loadChildren: '/compiled-js/app/accounting/sync/accounting-sync.module#AccountingSyncModule' },
                            { path: 'AccountClosure', component: AccountClosureComponent, canActivate: [AuthGuardService] },
                            { path: 'EditManualVoucher', component: ManualVoucherEditComponent, canActivate: [AuthGuardService] },
                            { path: 'ActivateHospital', component: ActivateAccountingHospitalComponent, canActivate: [AuthGuardService] },
                            { path: 'Payment', component: PaymentComponent, canActivate: [AuthGuardService] },
                            { path: "**", component: PageNotFound },
                        ]
                    },

                    { path: 'Settings', loadChildren: './settings/accounting-settings.module#AccountingSettingsModule', canActivate: [AuthGuardService] },

                    // START: mumbai-team-june2021-danphe-accounting-cache-change*
                    { path: 'Reports', component:AccountingReportsComponent, canActivate: [AuthGuardService]},
                    { path: 'Reports/BalanceSheetReport', component: BalanceSheetReportComponent,canActivate: [AuthGuardService]},
                    { path: 'Reports/LedgerReport', component: LedgerReportComponent,canActivate: [AuthGuardService] },
                    { path: 'Reports/VoucherReport', component: VoucherReportComponent,canActivate: [AuthGuardService] },
                    { path: 'Reports/TrailBalanceReport', component: TrailBalanceReportComponent,canActivate: [AuthGuardService] },
                    { path: 'Reports/ProfitLossReport', component: ProfitLossReportComponent,canActivate: [AuthGuardService] },
                    { path: 'Reports/DailyTransactionReport', component: DailyTransactionReportComponent,canActivate: [AuthGuardService] },
                    { path: 'Reports/CashFlowReport', component: CashFlowReportComponent,canActivate: [AuthGuardService] },
                    { path: 'Reports/DaywiseVoucherReport', component: DaywiseVoucherReportComponent,canActivate: [AuthGuardService] },
                    { path: 'Reports/SystemAuditReport', component: SystemAuditReportComponent,canActivate: [AuthGuardService] },
                  { path: 'Reports/GroupStatementReport', component: GroupStatementReportComponent, canActivate: [AuthGuardService] },
                  { path: 'Reports/BankReconciliation', component:BankReconciliationComponent,canActivate: [AuthGuardService] },
                    // END: mumbai-team-june2021-danphe-accounting-cache-change*
                    { path: "**", component: PageNotFound },
                    
                ]
            },

        ])
    ],
    exports: [
        RouterModule
    ]
})
export class AccountingRoutingModule {

}
