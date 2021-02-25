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
                            { path: "**", component: PageNotFound },
                        ]
                    },

                    { path: 'Settings', loadChildren: './settings/accounting-settings.module#AccountingSettingsModule', canActivate: [AuthGuardService] },
                    { path: 'Reports', loadChildren: './reports/accounting-reports.module#AccountingReportsModule', canActivate: [AuthGuardService] },
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
