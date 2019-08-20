import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";

import { AccountingComponent } from './accounting.component';
import { TransactionsMainComponent } from './transactions/transactions-main.component';
import { VoucherEntryComponent } from './transactions/voucher-entry.component';
import { AccountClosureComponent } from './transactions/account-closure.component';
import { TransferToAccountingComponent } from "./transactions/transfer-to-accounting.component";
import { AuthGuardService } from '../security/shared/auth-guard.service';

@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AccountingComponent,canActivate: [AuthGuardService] ,
                children: [
                    { path: '', redirectTo: 'Transaction/VoucherEntry', pathMatch: 'full' },
                    {

                        path: 'Transaction', component: TransactionsMainComponent,canActivate: [AuthGuardService] ,
                        children: [
                          { path: '', redirectTo: 'TransferToACC', pathMatch: 'full' },
                            { path: 'VoucherEntry', component: VoucherEntryComponent,canActivate: [AuthGuardService]  },
                            { path: 'TransferToACC', component: TransferToAccountingComponent,canActivate: [AuthGuardService]  },
                            //{ path: 'Sync', loadChildren: '/compiled-js/app/accounting/sync/accounting-sync.module#AccountingSyncModule' },
                            { path: 'AccountClosure', component: AccountClosureComponent,canActivate: [AuthGuardService]  }
                        ]
                    },

                    { path: 'Settings', loadChildren: './settings/accounting-settings.module#AccountingSettingsModule',canActivate: [AuthGuardService]  },
                    { path: 'Reports', loadChildren: './reports/accounting-reports.module#AccountingReportsModule',canActivate: [AuthGuardService]  },
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})
export class AccountingRoutingModule {

}
