import { CommonModule } from "@angular/common";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { NursingOrderListComponent } from "./order/nursing-order-list.component";
import { NursingOrderComponent } from "./order/nursing-order.component";

import { NephrologyComponent } from "./department/nephrology.component";
import { NursingInPatientComponent } from "./department/nursing-inpatient.component";
import { NursingOutPatientComponent } from "./department/nursing-outpatient.component";
import { NursingMainComponent } from "./nursing-main.component";
import { NursingRoutingModule } from "./nursing-routing.module";
import { NursingBLService } from "./shared/nursing.bl.service";
import { NursingDLService } from "./shared/nursing.dl.service";
import { NursingIpBillItemRequestComponent } from "./ward-billing/nursing-ip-billitem-request.component";

import { ADT_DLService } from "../adt/shared/adt.dl.service";
import { AppointmentDLService } from "../appointments/shared/appointment.dl.service";
import { VisitDLService } from "../appointments/shared/visit.dl.service";
import { BillingBLService } from "../billing/shared/billing.bl.service";
import { BillingDLService } from "../billing/shared/billing.dl.service";
import { OrdersBLService } from "../orders/shared/orders.bl.service";
import { PatientsBLService } from "../patients/shared/patients.bl.service";
import { PatientsDLService } from "../patients/shared/patients.dl.service";

import { LabsBLService } from "../labs/shared/labs.bl.service";
import { SharedModule } from "../shared/shared.module";
import { NursingOrderMainComponent } from "./order/nursing-order-main.component";
import { NursingWardBillingComponent } from "./ward-billing/nursing-ward-billing.component";
//import { DrugsRequestComponent } from "./drugs-request/drugs-request.component";
import { ADTSharedModule } from "../adt/adt-shared.module";
import { VisitBLService } from "../appointments/shared/visit.bl.service";
import { BillingSharedModule } from "../billing/billing-shared.module";
import { NoteTemplateBLService } from "../clinical-notes/shared/note-template.bl.service";
import { ClinicalSharedModule } from "../clinical/clinical-shared-module";
import { IOAllergyVitalsBLService } from "../clinical/shared/io-allergy-vitals.bl.service";
import { DoctorSharedModule } from "../doctors/doctor-shared.module";
import { MR_BLService } from "../medical-records/shared/mr.bl.service";
import { MR_DLService } from "../medical-records/shared/mr.dl.service";
import { OrderService } from "../orders/shared/order.service";
import { PharmacyModule } from "../pharmacy/pharmacy.module";
import { PharmacyBLService } from "../pharmacy/shared/pharmacy.bl.service";
import { PharmacyDLService } from "../pharmacy/shared/pharmacy.dl.service";
import { PharmacyService } from "../pharmacy/shared/pharmacy.service";
import { SettingsSharedModule } from "../settings-new/settings-shared.module";
import { DanpheAutoCompleteModule } from "../shared/danphe-autocomplete/danphe-auto-complete.module";
import { NursingOpdCheckinComponent } from "./check-in/nursing-opd-checkin.component";
import { NursingOpdChekoutComponent } from './check-out/nursing-opd-chekout.component';
import { ConsultationRequestViewPrintComponent } from "./consultation-requests/consultation-request-view-print/consultation-request-view-print.component";
import { ConsultationRequestsComponent } from "./consultation-requests/consultation-requests.component";
import { NewRequestComponent } from "./consultation-requests/new-request/new-request.component";
import { ActivateWardComponent } from "./department/activate-ward/activate-ward.component";
import { NursingReceiveNoteComponent } from "./department/nursing-receive-note.component";
import { TransferredPatientPendingComponent } from "./department/transferred-patient-pending.component";
import { AddPatientDietComponent } from "./diet-sheet/add-patient-diet.component";
import { DietSheetComponent } from "./diet-sheet/diet-sheet.component";
import { DietSheetPatientHistoryComponent } from "./diet-sheet/patient-history/diet-sheet-patient-history.component";
import { DietSheetPrintComponent } from "./diet-sheet/print/diet-sheet-print.component";
import { DrugRequestListComponent } from "./drugs-request/drug-request-list.component";
import { ExchangeDoctorDepartmentComponent } from './exchange-doctor-department/exchange-doctor-department.component';
import { NursingOpdFreeReferralComponent } from './free-referral/nursing-opd-free-referral.component';
import { InvestigationResultsPrintComponent } from "./investigation-results/investigation-results-print/investigation-results-print.component";
import { InvestigationResultsComponent } from "./investigation-results/investigation-results.component";
import { DischargeSummaryListComponent } from "./nursing-discharge-summary/discharge-summary-list.component";
import { NursingTransferComponent } from "./nursing-transfer/nursing-transfer.component";
import { OPDTriageComponent } from "./opd-triage/opd-triage.component";
import { NursingAddDiagnosisComponent } from "./shared/add-diagnosis/nursing-add-diagnosis.component";
import { NursingService } from "./shared/nursing-service";
import { WardSelectionGuardService } from "./shared/ward-selection-guard.service";
import { NursingIPRequestComponent } from "./ward-billing/nursing-ip-request.component";

@NgModule({
  providers: [
    WardSelectionGuardService,
    NursingBLService,
    NursingDLService,
    BillingBLService,
    VisitDLService,
    BillingDLService,
    OrdersBLService,
    PatientsDLService,
    AppointmentDLService,
    ADT_DLService,
    PatientsBLService,
    LabsBLService,
    PharmacyService,
    PharmacyBLService,
    PharmacyDLService,
    IOAllergyVitalsBLService,
    OrderService,
    VisitBLService,
    NoteTemplateBLService,
    MR_BLService,
    MR_DLService,
    NursingService
  ],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    //  Ng2AutoCompleteModule,
    NursingRoutingModule,
    SharedModule,
    DanpheAutoCompleteModule,
    BillingSharedModule,
    ClinicalSharedModule,
    DoctorSharedModule,
    ADTSharedModule,
    SettingsSharedModule,
    PharmacyModule
  ],
  declarations: [
    NursingMainComponent,
    NursingOrderMainComponent,
    NursingOrderComponent,
    NursingOrderListComponent,
    NursingOutPatientComponent,
    NursingInPatientComponent,
    NursingWardBillingComponent,
    //DrugsRequestComponent,
    DrugRequestListComponent,
    NursingIpBillItemRequestComponent,
    NephrologyComponent,
    NursingIPRequestComponent,
    ActivateWardComponent,
    NursingTransferComponent,
    NursingReceiveNoteComponent,
    TransferredPatientPendingComponent,
    DischargeSummaryListComponent,
    OPDTriageComponent,
    DietSheetComponent,
    DietSheetPrintComponent,
    DietSheetPatientHistoryComponent,
    AddPatientDietComponent,
    OPDTriageComponent,
    NursingOpdCheckinComponent,
    NursingAddDiagnosisComponent,
    NursingOpdFreeReferralComponent,
    NursingOpdChekoutComponent,
    NursingOpdFreeReferralComponent,
    ExchangeDoctorDepartmentComponent,
    ConsultationRequestsComponent,
    NewRequestComponent,
    ConsultationRequestViewPrintComponent,
    InvestigationResultsComponent,
    InvestigationResultsPrintComponent
  ],
  bootstrap: [NursingMainComponent],
})
export class NursingModule { }
