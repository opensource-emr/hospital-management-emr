/// <reference path="shared/accounting-settings.bl.service.ts" />
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete/danphe-auto-complete.module';
import { AccountingSettingsComponent } from './accounting-settings.component';
import { AccountingSettingsRoutingModule } from './accounting-settings-routing.module';

import { ItemsAddComponent } from './items/item-add.component';
import { ItemListComponent } from './items/item-list';

import { LedgersAddComponent } from './ledgers/ledger-add.component';
import { LedgersEditComponent } from './ledgers/ledger-edit.component';
import { LedgerListComponent } from './ledgers/ledger-list';

import { VouchersAddComponent } from './vouchers/voucher-add.component';
import { VoucherListComponent } from './vouchers/voucher-list';

import { AccountingSettingsBLService } from './shared/accounting-settings.bl.service';
import { AccountingSettingsDLService } from './shared/accounting-settings.dl.service';

import { LedgerGroupListComponent } from './ledgersgroup/ledger-group-list';
import { LedgerGroupAddComponent } from './ledgersgroup/ledger-group-add.component';
import { LedgerGroupVoucherManageComponent } from './ledgersgroup/ledgergroup-voucher-manage.component';

import { FiscalYearListComponent } from './fiscalyear/fiscalyear-list';
import { FiscalYearAddComponent } from './fiscalyear/fiscalyear-add.component';

import { CostCenterItemListComponent } from './costcenter/cost-center-item-list';
import { CostCenterItemAddComponent } from './costcenter/cost-center-item-add.component'

import { LedgerGroupCategoryListComponent } from './ledgersgroupcategory/ledger-group-category-list';
import { LedgerGroupCategoryAddComponent } from './ledgersgroupcategory/ledger-group-category-add.component'
import { SharedModule } from '../../shared/shared.module';

import { VoucherHeadListComponent } from './voucherhead/voucher-head-list';
import { VoucherHeadAddComponent } from './voucherhead/voucher-head-add';

import { ReverseTransaction } from './reverse-transaction/reverse-transaction.component';
import { SectionListComponent } from './section/section-list';
import { COAListComponent } from '../settings/coa/coa-list.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import {TransferRulesComponent} from '../settings/transfer-rules/transfer-rules.component';
///import { CommonFunctions } from '../../shared/common.functions';
@NgModule({
    providers: [AccountingSettingsBLService, AccountingSettingsDLService, 
        { provide: LocationStrategy, useClass: HashLocationStrategy }],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        DanpheAutoCompleteModule,
        AccountingSettingsRoutingModule,
        SharedModule,ScrollingModule],
    declarations: [
        AccountingSettingsComponent,
        ItemsAddComponent,
        ItemListComponent,
        LedgersAddComponent,
        LedgerListComponent,
        VouchersAddComponent,
        VoucherListComponent,
        LedgerGroupListComponent,
        LedgerGroupAddComponent,
        LedgerGroupVoucherManageComponent,
        FiscalYearListComponent,
        FiscalYearAddComponent,
        CostCenterItemListComponent,
        CostCenterItemAddComponent,
        LedgerGroupCategoryListComponent,
        LedgerGroupCategoryAddComponent,
        VoucherHeadListComponent,
        VoucherHeadAddComponent,
        LedgersEditComponent,
        ReverseTransaction,
        SectionListComponent,
        COAListComponent,
        TransferRulesComponent,
    ],

    bootstrap: [AccountingSettingsComponent]
})
export class AccountingSettingsModule { }
