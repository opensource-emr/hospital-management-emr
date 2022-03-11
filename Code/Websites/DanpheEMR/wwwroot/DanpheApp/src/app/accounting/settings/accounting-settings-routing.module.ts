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
import { ReverseTransaction } from "./reverse-transaction/reverse-transaction.component";
import { SectionListComponent } from './section/section-list';
import { COAListComponent } from './coa/coa-list.component';
import {TransferRulesComponent} from './transfer-rules/transfer-rules.component';
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
                    {path: 'ReverseTransaction', component:ReverseTransaction },
                    {path: 'SectionList', component:SectionListComponent },
                    {path: 'COAList',component:COAListComponent},
                    {path: 'TransferRules',component:TransferRulesComponent},
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