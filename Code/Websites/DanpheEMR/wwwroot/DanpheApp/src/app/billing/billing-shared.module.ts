import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { LabsBLService } from '../labs/shared/labs.bl.service';
import { LabsDLService } from '../labs/shared/labs.dl.service';
import { ImagingBLService } from '../radiology/shared/imaging.bl.service';
import { ImagingDLService } from '../radiology/shared/imaging.dl.service';
import { BillingBLService } from './shared/billing.bl.service';
import { BillingDLService } from './shared/billing.dl.service';

import { BillingPackageSelectComponent } from './bill-package/billing-package-select.component';
import { EditBillItemDocPriceComponent } from './update-doc-price/update-item-doc-pricecategory.component';
import { BillCopyReceiptComponent } from './bill-copy-receipt/bill-copy-receipt.component';

import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete';
import { BillPastTestListComponent } from './bill-transaction/billing-transaction-past-item.component';
import { SharedModule } from '../shared/shared.module';
import { EditBillItemComponent } from './ip-billing/edit-item/edit-bill-item.component';
import { UpdateItemPriceComponent } from './ip-billing/update-item-price/update-item-price.component';

@NgModule({
  providers: [
    LabsBLService,
    LabsDLService,
    ImagingBLService,
    ImagingDLService,
    BillingBLService,
    BillingDLService
  ],

  imports: [ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule,  
    SharedModule,
    DanpheAutoCompleteModule

  ],

  declarations: [
    BillingPackageSelectComponent,
    EditBillItemDocPriceComponent,
    BillCopyReceiptComponent,
    BillPastTestListComponent,
    EditBillItemComponent,
    UpdateItemPriceComponent
  ],

  exports: [
    CommonModule,
    FormsModule,
    RouterModule,

    BillingPackageSelectComponent,
    EditBillItemDocPriceComponent,
    BillCopyReceiptComponent,
    BillPastTestListComponent,
    EditBillItemComponent,
    UpdateItemPriceComponent

  ]
})
export class BillingSharedModule {

    
}
