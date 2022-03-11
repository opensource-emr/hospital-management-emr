import { NgModule } from '@angular/core';
import { SharedModule } from "../../shared/shared.module";
import { TransactionViewComponent } from "../transactions/transaction-view.component";
import { AccountingBLService } from './accounting.bl.service';
import { AccountingService } from './accounting.service';
import { AccountingDLService } from './accounting.dl.service';
import { LedgerCreateSharedComponent } from './ledger-create-shared/ledger-create-shared.component';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { VoucherEditComponent } from '../transactions/shared/edit-voucher/voucher-edit.component';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete/danphe-auto-complete.module';
import { fiscalyearlogSharedComponent } from './fiscal-yearlog-shared/fiscal-yearlog-shared.component';

@NgModule({
  providers: [AccountingBLService, AccountingDLService,
    AccountingService //mumbai-team-june2021-danphe-accounting-cache-change
  ],
    imports: [
        SharedModule,
        CommonModule,
        FormsModule,
        ReactiveFormsModule,DanpheAutoCompleteModule
    ],
    declarations: [
        TransactionViewComponent,LedgerCreateSharedComponent,VoucherEditComponent,fiscalyearlogSharedComponent
    ],
    exports: [TransactionViewComponent,SharedModule,LedgerCreateSharedComponent,VoucherEditComponent,fiscalyearlogSharedComponent]
})
export class AccountingSharedModule { }
