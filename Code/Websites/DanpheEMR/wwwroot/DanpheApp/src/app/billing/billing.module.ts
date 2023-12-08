import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
//commented for Quick-Appointment. //review it and correct it later: sudarshan.
//import { BillingService } from './shared/billing.service'
import { BillingRoutingModule } from "./billing-routing.module";

//Billing components
import { BillingDepositComponent } from './bill-deposit/billing-deposit.component';
import { OutpatientProvisionalBillingComponent } from './bill-provisional/outpatient-er-list/outpatient-provisional-billing.component';
import { BillingPayProvisionalComponent } from './bill-provisional/pay-provisional/billing-pay-provisional.component';
import { BillingTransactionComponent } from './bill-transaction/billing-transaction.component';
import { BillingMainComponent } from './billing-main.component';
import { BillingSearchPatientComponent_Old } from './search-patient/billing-search-patient-old.component';
//import { InsuranceProvisionalBillingComponent } from './bill-provisional/insurance-provisional-billing.component';
import { BillCancellationRequestComponent } from './bill-cancellation/bill-cancellation-request.component';
import { BillOrderRequestComponent } from './bill-request/bill-order-request.component';
import { EditDoctorFeatureComponent } from './edit-doctors/edit-doctor-feature.component';
import { EditDoctorComponent } from './shared/edit-doctor/edit-doctor.component';
//import { BillingPackageSelectComponent } from './bill-package/billing-package-select.component';
import { BillSettlementsComponent } from '../billing/bill-settlements/bill-settlements.component';
import { GroupDiscountComponent } from '../billing/ip-billing/group-discount/group-discount.component';
//import { UpdateItemPriceComponent } from './ip-billing/update-item-price/update-item-price.component';
import { QRCodeModule } from 'angular2-qrcode';
import { LabsDLService } from '../labs/shared/labs.dl.service';
import { PatientsDLService } from '../patients/shared/patients.dl.service';
import { SharedModule } from '../shared/shared.module';
import { BillingBLService } from './shared/billing.bl.service';
import { BillingDLService } from './shared/billing.dl.service';

//import { BillingHeaderComponent } from "../shared/billing-header/billing-header.component";

//appointment and visit DLServices
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';
import { VisitDLService } from '../appointments/shared/visit.dl.service';

import { BillingDashboardComponent } from '../dashboards/billing/billing-dashboard.component';
import { OrdersBLService } from "../orders/shared/orders.bl.service";
import { ImagingDLService } from '../radiology/shared/imaging.dl.service';
import { BillingSelectPatientCanActivateGuard } from "./shared/billing-select-patient-canactivate-guard";

import { SettlementsMainComponent } from '../billing/bill-settlements/settlements.main.component';

//sud: 31May'18--for provisional receipt--
import { ADT_DLService } from '../adt/shared/adt.dl.service';
import { QrBillingComponent } from '../shared/qr-code/billing/qr-billing.component';
import { ChangeVisitTypeComponent } from './change-visit/change-visit-type.component';
import { IpBillItemRequest } from './ip-billing/bill-request/ip-bill-item-request';
import { IpBillMainComponent } from './ip-billing/ip-billing.main.component';
import { PatientIpSummaryComponent } from './ip-billing/patient/patient-ip-summary.component';
//sud:30Sept'18--to replace ng-autocomplete with danphe-autocomplete
import { PatientsBLService } from '../patients/shared/patients.bl.service';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
//import { IPBillingRequestSlipComponent } from './print-pages/ip-item-request-print/ip-billing-request-slip.component';
import { PatientSharedModule } from '../patients/patient-shared.module';
import { SettingsSharedModule } from '../settings-new/settings-shared.module';
import { StickerSharedModule } from '../stickers/stickers-shared-module';
import { UtilitiesSharedModule } from '../utilities/shared/utilities-shared.module';
import { BillingCounterActivateComponent } from './bill-counter/billing-counter-activate.component';
import { BillingDenominationAccountsComponent } from './bill-denomination/Accounts/bill-denomination-accounts.component';
import { BillingDenominationCounterComponent } from './bill-denomination/Counter/bill-denomination-counter.component';
import { BillingDailyCollectionVsHandoverReportComponent } from './bill-denomination/Reports/bill-dailycollectionVsHandover-reports';
import { BillingDenominationReportComponent } from './bill-denomination/Reports/bill-denomination-reports.component';
import { BillingDenominationSummaryReportComponent } from './bill-denomination/Reports/bill-denomination-summary-reports';
import { TransferHandoverReportComponent } from './bill-denomination/Reports/transfer-handover-report/transfer-handover-report';
import { BillingDenominationMainComponent } from './bill-denomination/bill-denomination-main.component';
import { BIL_ProvisionalClearance_MainComponent } from './bill-provisional/bil-provisional-clearance-main.component';
import { BilProvisionalDischargeListComponent } from './bill-provisional/provisional-discharge-list/bil-provisional-discharge-list.component';
import { ProvisionalItemsViewDetailsComponent } from './bill-provisional/provisional-items-view-details/bil-provisional-items.component';
import { BILL_CreditNoteComponent } from './bill-return/bill-credit-note.component';
import { BillSettlementInvoiceDetail } from './bill-settlements/bill-settlement-invoice-detail.component';
import { BillingTransactionComponent_New } from './bill-transaction/billing-transaction-new.component';
import { BillingSharedModule } from './billing-shared.module';
import { BillOutpatientAddComponent } from './op-patient-add/bill-op-patient-add.component';
import { BillingPrintSharedModule } from './print-pages/billing-print-shared.module';
import { BillingSearchPatientNewComponent } from './search-patient/billing-search-patient-new.component';
import { BillingInvoiceBlService } from './shared/billing-invoice.bl.service';
import { BillingMasterBlService } from './shared/billing-master.bl.service';
import { BillingMasterDlService } from './shared/billing-master.dl.service';
@NgModule({
  providers: [
    BillingBLService, BillingDLService, LabsDLService,
    VisitDLService, AppointmentDLService, PatientsDLService,
    ImagingDLService, OrdersBLService, ADT_DLService, PatientsBLService,
    BillingMasterBlService, BillingMasterDlService, BillingInvoiceBlService,
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
    StickerSharedModule,
    UtilitiesSharedModule,
  ],
  declarations: [
    BillingMainComponent,
    BillingPayProvisionalComponent,
    BillingDepositComponent,
    BillingSearchPatientComponent_Old,
    BillingSearchPatientNewComponent,
    BillingTransactionComponent,
    OutpatientProvisionalBillingComponent,
    BillOrderRequestComponent,
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
    BillingDenominationMainComponent,
    BillingDenominationAccountsComponent,
    BillingDenominationCounterComponent,
    BillingDenominationReportComponent,
    BillingDenominationSummaryReportComponent,
    BillingDailyCollectionVsHandoverReportComponent,
    BillOutpatientAddComponent,
    BILL_CreditNoteComponent,
    BillSettlementInvoiceDetail,
    TransferHandoverReportComponent,
    BillSettlementInvoiceDetail,
    BillingTransactionComponent_New,
    BillingCounterActivateComponent,
    BIL_ProvisionalClearance_MainComponent,
    BilProvisionalDischargeListComponent,
    ProvisionalItemsViewDetailsComponent
  ],
  bootstrap: []//do we need anything here ? <sudarshan:2jan2017>
})
export class BillingModule { }
