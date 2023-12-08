import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { LabsBLService } from '../labs/shared/labs.bl.service';
import { LabsDLService } from '../labs/shared/labs.dl.service';
import { ImagingBLService } from '../radiology/shared/imaging.bl.service';
import { ImagingDLService } from '../radiology/shared/imaging.dl.service';
import { BillingBLService } from './shared/billing.bl.service';
import { BillingDLService } from './shared/billing.dl.service';

import { BillCopyReceiptComponent } from './bill-copy-receipt/bill-copy-receipt.component';
import { BillingPackageSelectComponent } from './bill-package/billing-package-select.component';
import { EditBillItemDocPriceComponent } from './update-doc-price/update-item-doc-pricecategory.component';

import { SettingsSharedModule } from '../settings-new/settings-shared.module';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete';
import { SharedModule } from '../shared/shared.module';
import { BillEditProvisionalItemsComponent } from './bill-provisional/edit-items/bill-edit-provisional-items.component';
import { BillPastTestListComponent } from './bill-transaction/billing-transaction-past-item.component';
import { EditBillItemComponent } from './ip-billing/edit-item/edit-bill-item.component';
import { PartialPaymentComponent } from './ip-billing/partial-payment/partial-payment.component';
import { UpdateItemPriceComponent } from './ip-billing/update-item-price/update-item-price.component';
import { BIL_Print_ProvisionalCancellationReceiptComponent } from './print-pages/bill-provisional-cancel-receipt/bill-provisional-cancel-receipt';
import { BillAdditionalItemSelectComponent } from './shared/additional-item-select/bill-additional-item-select.component';
import { BillingInvoiceBlService } from './shared/billing-invoice.bl.service';
import { BillingMasterBlService } from './shared/billing-master.bl.service';
import { BillingMasterDlService } from './shared/billing-master.dl.service';
import { SelectEthnicGroupComponent } from './shared/ethnic-group/select-ethnic-group.component';
import { OtherCurrencyCalculationComponent } from './shared/other-currency-calculation/other-currency-calcaultion.component';
import { PaymentModeInfoComponent } from './shared/payment-mode-info/payment-mode-info.component';
import { SelectPriceCategoryComponent } from './shared/price-category-select/price-category-select.component';
import { SchemePriceCategorySelectComponent } from './shared/scheme-pricecategory/scheme-pricecategory-select.component';
import { WardBillItemRequestComponent } from './shared/ward-bill-item-request/ward-billitem-request.component';

@NgModule({
  providers: [
    LabsBLService,
    LabsDLService,
    ImagingBLService,
    ImagingDLService,
    BillingBLService,
    BillingDLService,
    BillingMasterBlService,
    BillingMasterDlService,
    BillingInvoiceBlService
  ],

  imports: [ReactiveFormsModule,
    FormsModule,
    CommonModule,
    RouterModule,
    SharedModule,
    DanpheAutoCompleteModule,
    SettingsSharedModule
  ],

  declarations: [
    BillingPackageSelectComponent,
    EditBillItemDocPriceComponent,
    BillCopyReceiptComponent,
    BillPastTestListComponent,
    EditBillItemComponent,
    UpdateItemPriceComponent,
    SelectPriceCategoryComponent,
    WardBillItemRequestComponent,
    PartialPaymentComponent,//pratik: 28 April 2020
    PaymentModeInfoComponent,//pratik: 22 june 2020
    SelectEthnicGroupComponent,
    SchemePriceCategorySelectComponent,
    BillAdditionalItemSelectComponent,
    BIL_Print_ProvisionalCancellationReceiptComponent,
    OtherCurrencyCalculationComponent,
    BillEditProvisionalItemsComponent
  ],

  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    WardBillItemRequestComponent,
    BillingPackageSelectComponent,
    EditBillItemDocPriceComponent,
    BillCopyReceiptComponent,
    BillPastTestListComponent,
    EditBillItemComponent,
    UpdateItemPriceComponent,
    SelectPriceCategoryComponent,
    PartialPaymentComponent,//pratik: 28 April 2020
    PaymentModeInfoComponent,//pratik: 22 june 2020
    SelectEthnicGroupComponent,
    SchemePriceCategorySelectComponent,
    BillAdditionalItemSelectComponent,
    BIL_Print_ProvisionalCancellationReceiptComponent,
    OtherCurrencyCalculationComponent,
    BillEditProvisionalItemsComponent
  ]
})
export class BillingSharedModule {


}
