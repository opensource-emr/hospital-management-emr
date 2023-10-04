import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete/danphe-auto-complete.module';
import { SharedModule } from "../../shared/shared.module";
import { VoucherEntryNewComponent } from '../transactions/new-voucher-entry/new-voucher-entry.component';
import { LedgerGroupAddReusableComponent } from '../transactions/shared/create-ledger-group-reusable/ledger-group-add-reusable.component';
import { LedgersAddReusableComponent } from '../transactions/shared/create-ledger-reusable/ledger-add-reusable.component';
import { VoucherEditComponent } from '../transactions/shared/edit-voucher/voucher-edit.component';
import { TransactionViewComponent } from "../transactions/transaction-view.component";
import { AccountingBLService } from './accounting.bl.service';
import { AccountingDLService } from './accounting.dl.service';
import { AccountingService } from './accounting.service';
import { fiscalyearlogSharedComponent } from './fiscal-yearlog-shared/fiscal-yearlog-shared.component';
import { LedgerCreateSharedComponent } from './ledger-create-shared/ledger-create-shared.component';

@NgModule({
  providers: [AccountingBLService, AccountingDLService,
    AccountingService //mumbai-team-june2021-danphe-accounting-cache-change
  ],
  imports: [
    SharedModule,
    CommonModule,
    FormsModule,
    ReactiveFormsModule, DanpheAutoCompleteModule
  ],
  declarations: [
    TransactionViewComponent, LedgerCreateSharedComponent, VoucherEditComponent, fiscalyearlogSharedComponent, VoucherEntryNewComponent, LedgersAddReusableComponent, LedgerGroupAddReusableComponent
  ],
  exports: [TransactionViewComponent, SharedModule, LedgerCreateSharedComponent, VoucherEditComponent, fiscalyearlogSharedComponent, VoucherEntryNewComponent, LedgersAddReusableComponent, LedgerGroupAddReusableComponent]
})
export class AccountingSharedModule { }
