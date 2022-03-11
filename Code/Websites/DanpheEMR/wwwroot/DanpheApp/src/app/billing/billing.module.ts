import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

//commented for Quick-Appointment. //review it and correct it later: sudarshan.
//import { BillingService } from './shared/billing.service'
import { BillingRoutingModule } from "./billing-routing.module";

//Billing components
import { BillingTransactionComponent } from './bill-transaction/billing-transaction.component';
import { BillingMainComponent } from './billing-main.component';
import { BillingTransactionItemComponent } from './bill-transaction/billing-transaction-item.component';
import { BillingDepositComponent } from './bill-deposit/billing-deposit.component';
import { BillingSearchPatientComponent } from './search-patient/billing-search-patient.component';
import { ProvisionalBillingComponent } from './bill-provisional/provisional-billing.component';
//import { InsuranceProvisionalBillingComponent } from './bill-provisional/insurance-provisional-billing.component';
import { BillOrderRequestComponent } from './bill-request/bill-order-request.component';
import { BillCancellationRequestComponent } from './bill-cancellation/bill-cancellation-request.component';
import { BillingCounterActivateComponent } from './bill-counter/billing-counter-activate.component';
import { EditDoctorFeatureComponent } from './edit-doctors/edit-doctor-feature.component';
import { EditDoctorComponent } from './shared/edit-doctor/edit-doctor.component';
//import { BillingPackageSelectComponent } from './bill-package/billing-package-select.component';
import { BillSettlementsComponent } from '../billing/bill-settlements/bill-settlements.component';
import { GroupDiscountComponent } from '../billing/ip-billing/group-discount/group-discount.component';
//import { UpdateItemPriceComponent } from './ip-billing/update-item-price/update-item-price.component';
import { BillingBLService } from './shared/billing.bl.service';
import { BillingDLService } from './shared/billing.dl.service';
import { LabsDLService } from '../labs/shared/labs.dl.service';
import { PatientsDLService } from '../patients/shared/patients.dl.service';
import { SharedModule } from '../shared/shared.module';
import { QRCodeModule } from 'angular2-qrcode';

//import { BillingHeaderComponent } from "../shared/billing-header/billing-header.component";

//appointment and visit DLServices
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';

import { ImagingDLService } from '../radiology/shared/imaging.dl.service';
import { BillingDashboardComponent } from '../dashboards/billing/billing-dashboard.component';
import { OrdersBLService } from "../orders/shared/orders.bl.service";
import { BillingSelectPatientCanActivateGuard } from "./shared/billing-select-patient-canactivate-guard";

import { SettlementsMainComponent } from '../billing/bill-settlements/settlements.main.component';

//sud: 31May'18--for provisional receipt--
import { QrBillingComponent } from '../shared/qr-code/billing/qr-billing.component';
import { ADT_DLService } from '../adt/shared/adt.dl.service';
import { IpBillMainComponent } from './ip-billing/ip-billing.main.component';
import { PatientIpSummaryComponent } from './ip-billing/patient/patient-ip-summary.component';
import { IpBillItemRequest } from './ip-billing/bill-request/ip-bill-item-request';
import { ChangeVisitTypeComponent } from './change-visit/change-visit-type.component';
//sud:30Sept'18--to replace ng-autocomplete with danphe-autocomplete
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { PatientsBLService } from '../patients/shared/patients.bl.service';
//import { IPBillingRequestSlipComponent } from './print-pages/ip-item-request-print/ip-billing-request-slip.component';
import { BillingSharedModule } from './billing-shared.module';
import { BillOutpatientAddComponent } from './op-patient-add/bill-op-patient-add.component';
import { PatientSharedModule } from '../patients/patient-shared.module';
import { SettingsSharedModule } from '../settings-new/settings-shared.module';
import { BillingSearchPatientNewComponent } from './search-patient/billing-search-patient-new.component';
import { BillingDenominationAccountsComponent } from './bill-denomination/Accounts/bill-denomination-accounts.component';
import { BillingDenominationMainComponent } from './bill-denomination/bill-denomination-main.component';
import { BillingDenominationCounterComponent } from './bill-denomination/Counter/bill-denomination-counter.component';
import { BillingDenominationReportComponent } from './bill-denomination/Reports/bill-denomination-reports.component';
import { BillingDenominationComponent } from './bill-denomination/bill-denomination.component-old';
import { BILL_CreditNoteComponent } from './bill-return/bill-credit-note.component';
import { BillingPrintSharedModule } from './print-pages/billing-print-shared.module';
import { ReceiptPrintMainComponent_Old } from './print-pages/invoice-main/receipt-print-main-old.component';
import { BillingReceiptComponent_Old } from './print-pages/op-normal-invoice/billing-receipt-old.component';
import { BillingDenominationSummaryReportComponent } from './bill-denomination/Reports/bill-denomination-summary-reports';
import { BillingDailyCollectionVsHandoverReportComponent } from './bill-denomination/Reports/bill-dailycollectionVsHandover-reports';
import { StickerSharedModule } from '../stickers/stickers-shared-module';
import { BillSettlementInvoiceDetail } from './bill-settlements/bill-settlement-invoice-detail.component';
@NgModule({
  providers: [
    BillingBLService, BillingDLService, LabsDLService,
    VisitDLService, AppointmentDLService, PatientsDLService,
    ImagingDLService, OrdersBLService, ADT_DLService, PatientsBLService,
    BillingSelectPatientCanActivateGuard],

  imports: [BillingRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    DanpheAutoCompleteModule,
    FormsModule, SharedModule, QRCodeModule,
    BillingSharedModule,
    PatientSharedModule,
    SettingsSharedModule,
    BillingPrintSharedModule,
    StickerSharedModule
  ],
  declarations: [
    BillingMainComponent,
    BillingTransactionItemComponent,
    BillingDepositComponent,
    BillingSearchPatientComponent,
    BillingSearchPatientNewComponent,
    BillingTransactionComponent,
    ProvisionalBillingComponent,
    BillOrderRequestComponent,
    BillingCounterActivateComponent,
    BillCancellationRequestComponent,
    BillingDashboardComponent,
    EditDoctorFeatureComponent,
    EditDoctorComponent,
    BillSettlementsComponent,
    GroupDiscountComponent,
    QrBillingComponent,
    IpBillMainComponent,//sud:10Sept'18
    PatientIpSummaryComponent,
    IpBillItemRequest,
    ChangeVisitTypeComponent,
    SettlementsMainComponent,
    BillingDenominationComponent,
    BillingDenominationMainComponent,
    BillingDenominationAccountsComponent,
    BillingDenominationCounterComponent,
    BillingDenominationReportComponent,
    BillingDenominationSummaryReportComponent,
    BillingDailyCollectionVsHandoverReportComponent,
    BillOutpatientAddComponent,
    BILL_CreditNoteComponent,
    ReceiptPrintMainComponent_Old,
    BillingReceiptComponent_Old,
    BillSettlementInvoiceDetail
  ],
  bootstrap: []//do we need anything here ? <sudarshan:2jan2017>
})
export class BillingModule { }
