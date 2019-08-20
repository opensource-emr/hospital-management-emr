import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { ItemListComponent } from './items/item-list';
import { LedgerListComponent } from './ledgers/ledger-list';
import { VoucherListComponent } from './vouchers/voucher-list';
import { LedgerGroupListComponent } from './ledgersgroup/ledger-group-list';


import { AccountingSettingsComponent } from './accounting-settings.component';
import { FiscalYearListComponent } from './fiscalyear/fiscalyear-list';
import { CostCenterItemListComponent } from './costcenter/cost-center-item-list';
import { LedgerGroupCategoryListComponent } from './ledgersgroupcategory/ledger-group-category-list';
import { VoucherHeadListComponent} from './voucherhead/voucher-head-list';


@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',
                component: AccountingSettingsComponent,
                children: [
                    { path: '', redirectTo: 'LedgerList', pathMatch: 'full' },
                    { path: 'ItemList', component: ItemListComponent },
                    { path: 'LedgerList', component: LedgerListComponent },
                    { path: 'VoucherList', component: VoucherListComponent },
                    { path: 'LedgerGroupList', component: LedgerGroupListComponent },
                    { path: 'FiscalYearList', component: FiscalYearListComponent },
                    { path: 'CostCenterItemList', component: CostCenterItemListComponent },
                    { path: 'LedgerGroupCategoryList', component: LedgerGroupCategoryListComponent },
                    { path: 'VoucherHeadList', component: VoucherHeadListComponent },
                ]
            }
        ])
    ],
    exports: [
        RouterModule
    ]
})

export class AccountingSettingsRoutingModule {

}