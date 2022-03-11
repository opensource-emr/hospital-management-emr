import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { BillingBLService } from '../shared/billing.bl.service';
import { BillingDLService } from '../shared/billing.dl.service';

import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete';
import { SharedModule } from '../../shared/shared.module';
import { BIL_Print_ProvisionalSlip_Component } from './provisional-slip/bil-print-provisional-slip.component';
import { BIL_Print_Invoice_Discharge_Component } from './ip-discharge-invoice/bil-print-invoice-discharge.component';
import { BIL_Print_SettlementSlip_Component } from './settlement-slip/bil-print-settlement-slip.component';
import { DepositReceiptComponent } from './deposit-slip/bil-print-deposit-slip.component';
import { BIL_Print_IP_Estimation } from './ip-estimation/bil-print-ip-estimation.component';
// import { DischargeBillBreakupComponent } from './ip-discharge-invoice/breakup/discharge-bill-breakup.component';
import { DischargeBillSummaryComponent } from './ip-discharge-invoice/summary/discharge-bill-summary.component';
import { BIL_Print_IpItemRequest_Slip } from './ip-item-request-print/bil-print-ip-item-request-slip.component';
import { Bil_Print_InvoiceMain_Component } from './invoice-main/bil-print-invoice-main.component';
import { Bil_Print_Invoice_DefaultComponent } from './op-normal-invoice/bil-print-invoice-default.component';
import { Bill_Print_CreditNote_Component } from './credit-note/bill-print-credit-note.component';
import { SettingsSharedModule } from '../../settings-new/settings-shared.module';

@NgModule({
  providers: [

    BillingBLService,
    BillingDLService
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
    BIL_Print_ProvisionalSlip_Component,
    BIL_Print_Invoice_Discharge_Component,
    BIL_Print_SettlementSlip_Component,
    DepositReceiptComponent,
    BIL_Print_IP_Estimation,
    // DischargeBillBreakupComponent,
    DischargeBillSummaryComponent,
    BIL_Print_IpItemRequest_Slip,
    Bil_Print_InvoiceMain_Component,
    Bil_Print_Invoice_DefaultComponent,
    Bill_Print_CreditNote_Component
  ],

  exports: [
    CommonModule,
    FormsModule,
    RouterModule,
    BIL_Print_ProvisionalSlip_Component,
    BIL_Print_Invoice_Discharge_Component,
    BIL_Print_SettlementSlip_Component,
    DepositReceiptComponent,
    BIL_Print_IP_Estimation,
    // DischargeBillBreakupComponent,
    DischargeBillSummaryComponent,
    BIL_Print_IpItemRequest_Slip,
    Bil_Print_InvoiceMain_Component,
    Bil_Print_Invoice_DefaultComponent,
    Bill_Print_CreditNote_Component
  ]
})
export class BillingPrintSharedModule {


}
