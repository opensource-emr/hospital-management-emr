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

@NgModule({
    providers: [AccountingDLService, AccountingBLService,
        { provide: LocationStrategy, useClass: HashLocationStrategy }],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        
        DanpheAutoCompleteModule,
        AccountingSharedModule,
      AccountingRoutingModule,
      AccountingSettingsModule
    ],
    declarations: [
        AccountingComponent,
        TransactionsMainComponent,
        VoucherEntryComponent,
        AccountClosureComponent,
        TransferToAccountingComponent,
      AccountingSyncBaseComponent,
      LedgersAddReusableComponent,
      LedgerGroupAddReusableComponent
    ],
    bootstrap: []
})
export class AccountingModule { }
