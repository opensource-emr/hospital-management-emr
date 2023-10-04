import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { BillingDLService } from '../billing/shared/billing.dl.service';
import { SharedModule } from "../shared/shared.module";
import { AngularMultiSelectModule } from "angular2-multiselect-dropdown";
import { PatientsDLService } from '../patients/shared/patients.dl.service';
import { BillingBLService } from '../billing/shared/billing.bl.service';
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { ADT_DLService } from '../adt/shared/adt.dl.service';
import { ADT_BLService } from '../adt/shared/adt.bl.service';
import { EmergencyDashboardComponent } from '../dashboards/emergency/emergency-dashboard.component';
import { EmergencyRoutingModule } from './emergency-routing.module';
import { EmergencyMainComponent } from './emergency-main.component';
import { ERPatientListComponent } from './patients-list/er-patient-list.component';
import { ERTriagePatientListComponent } from './triage/er-triage-patient-list.component';
import { EmergencyBLService } from './shared/emergency.bl.service';
import { EmergencyDLService } from './shared/emergency.dl.service';
import { ERPatientRegistrationComponent } from './registration/er-patient-registration.component';
import { ERTriageActionComponent } from './triage/er-triage-actions.component';
import { ERWardBillingComponent } from './ER-ward-billing/er-wardbilling.component';
import { PatientsBLService } from '../patients/shared/patients.bl.service';
import { VisitBLService } from '../appointments/shared/visit.bl.service';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';
import { ERLamaComponent } from './triage/er-lama.component';
import { ERFinalizedComponent } from './finalized-patients/er-finalized-patients.component';
import { ERLamaPatientListComponent } from './finalized-patients/er-lama-patient-list.component';
import { ERTransferredPatientListComponent } from './finalized-patients/er-transferred-patient-list.component';
import { ERDischargedPatientListComponent } from './finalized-patients/er-discharged-patient-list.component';
import { ERDeathPatientListComponent } from './finalized-patients/er-death-patient-list.component';
import { ERAdmittedPatientListComponent } from './finalized-patients/er-admitted-patient-list.component';
import { DischargeSummaryModule } from '../discharge-summary/discharge-summary.module';
import { ERDoctorAssignComponent } from './triage/assign-doctor.component';
import { PharmacyBLService } from '../pharmacy/shared/pharmacy.bl.service';
import { PharmacyDLService } from '../pharmacy/shared/pharmacy.dl.service';
import { NursingBLService } from '../nursing/shared/nursing.bl.service';
import { NursingDLService } from '../nursing/shared/nursing.dl.service';
import { BedInformationsComponent } from './bed-informations/bed-informations.component';
import { IOAllergyVitalsBLService } from '../clinical/shared/io-allergy-vitals.bl.service';
import { ERDischargeSummaryComponent } from './discharge/er-discharge-summary.component';
import { ViewERDischargeSummaryComponent } from './discharge/view-er-discharge-summary.component';
import { AddERDischargeSummaryComponent } from './discharge/add-er-discharge-summary.component';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete';
import { BillingSharedModule } from '../billing/billing-shared.module';
import { ERDorPatientListComponent } from './finalized-patients/er-dor-patient-list.component';
import { ADTSharedModule } from '../adt/adt-shared.module';
import { ClinicalSharedModule } from '../clinical/clinical-shared-module';
import { PatientSharedModule } from '../patients/patient-shared.module';
import { DoctorSharedModule } from '../doctors/doctor-shared.module';
import { EmergencyService } from './shared/emergency.service';
import { PatientCasesSelectComponent } from './shared/select-cases/select-patient-case.component';
import { uploadConsentAcionComponent } from './patients-list/Consent/upload-consent.component';

@NgModule({
  providers: [
    EmergencyBLService,
    EmergencyDLService,
    ADT_BLService,
    ADT_DLService,
    PatientsBLService,
    VisitBLService,
    PharmacyBLService,
    PharmacyDLService,
    NursingBLService,
    NursingDLService,
    IOAllergyVitalsBLService,
    VisitDLService,
    AppointmentDLService,
    PatientsDLService,
    EmergencyService
  ],
  imports: [
    EmergencyRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    AngularMultiSelectModule,
    SharedModule,
    DischargeSummaryModule,
    DanpheAutoCompleteModule,
    BillingSharedModule,
    ADTSharedModule,
    ClinicalSharedModule,
    DoctorSharedModule,
    PatientSharedModule
  ],
  declarations: [
    EmergencyMainComponent,
    EmergencyDashboardComponent,
    ERPatientListComponent,
    ERTriagePatientListComponent,
    ERPatientRegistrationComponent,
    ERTriageActionComponent,
    ERWardBillingComponent,
    ERLamaComponent,
    ERFinalizedComponent,
    ERLamaPatientListComponent,
    ERTransferredPatientListComponent,
    ERDischargedPatientListComponent,
    ERDeathPatientListComponent,
    ERAdmittedPatientListComponent,
    ERDoctorAssignComponent,
    BedInformationsComponent,
    ERDischargeSummaryComponent,
    ViewERDischargeSummaryComponent,
    AddERDischargeSummaryComponent,
    ERDorPatientListComponent,
    PatientCasesSelectComponent,
    uploadConsentAcionComponent
  ],
  bootstrap: []

})
export class EmergencyModule { }
