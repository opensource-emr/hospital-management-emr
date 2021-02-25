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
import { ReceiptPrintMainComponent } from './receipt/receipt-print-main.component';
import { BillOrderRequestComponent } from './bill-request/bill-order-request.component';
import { BillCancellationRequestComponent } from './bill-cancellation/bill-cancellation-request.component';
import { BillReturnRequestComponent } from './bill-return/bill-return-request.component';
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
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { BillingReceiptComponent } from './receipt/billing-receipt.component';
import { OrdersBLService } from "../orders/shared/orders.bl.service";
import { BillingSelectPatientCanActivateGuard } from "./shared/billing-select-patient-canactivate-guard";

//import { DepositReceiptComponent } from "./bill-deposit/deposit-receipt.component";
import { BillSettlementReceiptComponent } from "./bill-settlements/settlement-receipt.component";
import { BillDuplicatePrintsMainComponent } from "./bill-duplicate-prints/bill-duplicate-prints-main.component";
import { DuplicateInvoicePrintComponent } from './bill-duplicate-prints/duplicate-invoice-print.component';
import { DuplicateDepositReceiptComponent } from "./bill-duplicate-prints/duplicate-deposit-receipt-print.component";
import { DuplicateCreditSettlementReceiptComponent } from "./bill-duplicate-prints/duplicate-credit-settlement-receipt-print.component";
import { DuplicateDepositSettlementReceiptPrintComponent } from "./bill-duplicate-prints/duplicate-deposit-settlement-receipt-print.component";

import { SettlementsMainComponent } from '../billing/bill-settlements/settlements.main.component';

//sud: 31May'18--for provisional receipt--
import { BillingProvisionalReceiptComponent } from "./receipt/billing-provisional-receipt.component";
import { QrBillingComponent } from '../shared/qr-code/billing/qr-billing.component';
import { IPBillingReceiptComponent } from './receipt/ip-billing-receipt.component';
import { ADT_DLService } from '../adt/shared/adt.dl.service';
import { IpBillMainComponent } from './ip-billing/ip-billing.main.component';
import { PatientIpSummaryComponent } from './ip-billing/patient/patient-ip-summary.component';
import { IpBillItemRequest } from './ip-billing/bill-request/ip-bill-item-request';
import { ChangeVisitTypeComponent } from './change-visit/change-visit-type.component';
//sud:30Sept'18--to replace ng-autocomplete with danphe-autocomplete
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';

import { IPDischargeBillBreakupComponent } from './ip-billing/receipts/ip-discharge-bill-breakup.component';
import { PatientsBLService } from '../patients/shared/patients.bl.service';
import { IPBillingRequestSlipComponent } from './receipt/ip-billing-request-slip.component';
import { BillingDenominationComponent } from '../billing/bill-denomination/bill-denomination.component'
import { DuplicateProvisionalReceiptComponent } from './bill-duplicate-prints/duplicate-provisional-receipt.component';
import { BillingSharedModule } from './billing-shared.module';
import { BillOutpatientAddComponent } from './op-patient-add/bill-op-patient-add.component';
import { PatientSharedModule } from '../patients/patient-shared.module';
import { BillReturnPartialComponent } from './bill-return/partial-return/bill-return-partial.component';


import { SettingsSharedModule } from '../settings-new/settings-shared.module';
@NgModule({
  providers: [
    //BillingService,//commented for Quick-Appointment. //review it and correct it later: sudarshan.
    BillingBLService, BillingDLService, LabsDLService,

    VisitDLService, AppointmentDLService, PatientsDLService,
    ImagingDLService, OrdersBLService, ADT_DLService, PatientsBLService,
    BillingSelectPatientCanActivateGuard],

  imports: [BillingRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    // AgGridModule.forRoot(),
    DanpheAutoCompleteModule,
    FormsModule, SharedModule, QRCodeModule,
    BillingSharedModule,
    PatientSharedModule,
    SettingsSharedModule
  ],
  declarations: [
    BillingMainComponent,
    BillingTransactionItemComponent,
    BillingDepositComponent,
    BillingSearchPatientComponent,
    BillingTransactionComponent,
    ProvisionalBillingComponent,
    ReceiptPrintMainComponent,//sud: 17June'18--folder structure and names changed as per angular structure.
    BillingReceiptComponent,
    BillOrderRequestComponent,
    BillingCounterActivateComponent,
    BillCancellationRequestComponent,
    BillReturnRequestComponent,
    BillingDashboardComponent,
    EditDoctorFeatureComponent,
    EditDoctorComponent,
    //BillingPackageSelectComponent,
    BillSettlementsComponent,
    BillSettlementReceiptComponent,
    BillDuplicatePrintsMainComponent,
    DuplicateInvoicePrintComponent,
    DuplicateDepositReceiptComponent,
    DuplicateCreditSettlementReceiptComponent,
    DuplicateDepositSettlementReceiptPrintComponent,
    //BillCopyReceiptComponent,
    GroupDiscountComponent,
    BillingProvisionalReceiptComponent,
    QrBillingComponent,
    IPBillingReceiptComponent,//sud:20Aug'18
    //EditBillItemComponent,
    //UpdateItemPriceComponent,
    IpBillMainComponent,//sud:10Sept'18
    // IPDischargeBillBreakupComponent,
    PatientIpSummaryComponent,
    IpBillItemRequest,
    ChangeVisitTypeComponent,
    //EditBillItemDocPriceComponent,
    IPDischargeBillBreakupComponent,
    BillSettlementReceiptComponent,
    IPBillingRequestSlipComponent, //Hom: 24 April'19
    SettlementsMainComponent,
    //InsuranceSettlementsComponent,
    //BillInsuranceMainComponent,
    //UpdateInsuranceBalanceComponent,
    BillingDenominationComponent,
    DuplicateProvisionalReceiptComponent,
    BillOutpatientAddComponent,
    //BillPastTestListComponent,
    //InsuranceProvisionalBillingComponent, //Yubraj: 3rd July '19
    //InsuranceBillItemRequest //Yubraj: 14th july '19
    BillReturnPartialComponent,//Rajesh: 12sept'19
  ],
  bootstrap: []//do we need anything here ? <sudarshan:2jan2017>
})
export class BillingModule { }
