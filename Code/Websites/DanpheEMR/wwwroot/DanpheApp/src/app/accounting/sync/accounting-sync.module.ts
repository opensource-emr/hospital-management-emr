import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete/danphe-auto-complete.module';

import { SharedModule } from '../../shared/shared.module';
import { AccountingSyncRoutingModule } from './accounting-sync-routing.module';
import { AccountingSyncComponent } from './accounting-sync.component';
import { InventorySyncComponent } from './inventory-sync/inventory-sync.component';
import { AccountingSyncDLService } from "./shared/accounting-sync.dl.service";
import { AccountingSharedModule } from "../shared/accounting-shared.module";
@NgModule({
    providers: [AccountingSyncDLService,{ provide: LocationStrategy, useClass: HashLocationStrategy }],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        DanpheAutoCompleteModule,
        AccountingSyncRoutingModule,
        AccountingSharedModule
    ],
    declarations: [
        AccountingSyncComponent,
        InventorySyncComponent
    ],

    bootstrap: [AccountingSyncComponent]
})
export class AccountingSyncModule { }