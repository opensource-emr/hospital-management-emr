import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';
import { ADT_BLService } from './shared/adt.bl.service';
import { ADT_DLService } from './shared/adt.dl.service';

import { VisitBLService } from '../appointments/shared/visit.bl.service';
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { BillingDLService } from '../billing/shared/billing.dl.service';
import { IOAllergyVitalsBLService } from '../clinical/shared/io-allergy-vitals.bl.service';
import { LabsDLService } from '../labs/shared/labs.dl.service';
import { PatientsBLService } from '../patients/shared/patients.bl.service';
import { PatientsDLService } from '../patients/shared/patients.dl.service';
import { ImagingDLService } from '../radiology/shared/imaging.dl.service';


import { ADTRoutingModule } from './adt-routing.module';
//import { AdmissionComponent } from './admission.component';
import { SharedModule } from '../shared/shared.module';
import { AdmissionCancelComponent } from './admission/adm-cancel/admission-cancel.component';
import { AdmissionCreateComponent } from './admission/adm-create/admission-create.component';
import { AdmittedListComponent } from './admission/adm-list/admitted-list.component';
import { AdmissionSearchPatient } from './admission/search-patient/admission-search-patient.component';
import { AdtHomeComponent } from './adt-home.component';
import { ADTMainComponent } from './adt-main.component';
import { ChangeDoctorComponent } from './change-doctor/change-doctor.component';
import { DischargedListComponent } from './discharge/discharge-list.component';
import { AdmissionPrintStickerComponent } from './sticker/admission-print-sticker.component';
import { UpgradeComponent } from './upgrade/upgrade.component';
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { AgGridModule } from 'ag-grid-angular/main';
import { RegistrationSchemeSharedModule } from '../appointments/shared/registration-scheme/registration-scheme-shared.module';
import { BillingSharedModule } from '../billing/billing-shared.module';
import { BillingPrintSharedModule } from '../billing/print-pages/billing-print-shared.module';
import { ClinicalSharedModule } from '../clinical/clinical-shared-module';
import { DischargeSummaryModule } from '../discharge-summary/discharge-summary.module';
import { SettingsSharedModule } from '../settings-new/settings-shared.module';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { ADTSharedModule } from './adt-shared.module';
import { IPWristBandPrintComponent } from './ip-wrist-band/ip-wrist-band-print.component';
import { PatientBedHistory } from './patient-bed-history/patient-bed-history.component';
import { AdmissionSelectPatientCanActivateGuard } from './shared/admission-select-patient-canactivate-guard';

@NgModule({
  providers: [
    ADT_DLService,
    ADT_BLService,
    VisitBLService,
    VisitDLService,
    AppointmentDLService,
    PatientsBLService,
    PatientsDLService,
    ImagingDLService,
    LabsDLService,
    BillingDLService,
    AdmissionSelectPatientCanActivateGuard,
    IOAllergyVitalsBLService],
  imports: [ADTRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    AgGridModule.withComponents(ADTMainComponent),
    FormsModule, SharedModule, ADTSharedModule, DischargeSummaryModule,
    DanpheAutoCompleteModule,
    ClinicalSharedModule,
    SettingsSharedModule,
    BillingPrintSharedModule,
    BillingSharedModule,
    RegistrationSchemeSharedModule,
  ],
  declarations: [
    ADTMainComponent,
    AdmissionCreateComponent,
    AdmissionSearchPatient,
    AdmittedListComponent,
    //TransferComponent, // moved to shared module to use in nursing modulw
    DischargedListComponent,
    UpgradeComponent,
    AdtHomeComponent,
    AdmissionPrintStickerComponent,
    PatientBedHistory,
    AdmissionCancelComponent,
    IPWristBandPrintComponent,
    ChangeDoctorComponent
    //AdmittedPatientHistory// moved to shared module to use in nursing modulw
  ],
  bootstrap: []//do we need anything here ? <sudarshan:2jan2017>
})
export class ADTModule { }
