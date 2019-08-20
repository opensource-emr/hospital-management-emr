import { NgModule } from '@angular/core';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';

import { PatientsBLService } from './shared/patients.bl.service';
import { PatientsDLService } from './shared/patients.dl.service';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { ImagingDLService } from '../radiology/shared/imaging.dl.service';
import { LabsDLService } from '../labs/shared/labs.dl.service';
import { ClinicalDLService } from '../clinical/shared/clinical.dl.service';
import { AdmissionDLService } from '../admission/shared/admission.dl.service';
import { PatientsRoutingConstant } from "./patients-routing.constant"
import { PatientsMainComponent } from './patients-main.component';
import { PatientRegistrationMainComponent } from './registration/patient-registration-main.component';

import { GuarantorComponent } from './registration/guarantor.component';
import { InsuranceInfoComponent } from './registration/insurance-info.component';
import { KinEmergencyContactComponent } from './registration/kin-emergency-contact.component';
import { AddressComponent } from './registration/address.component';
import { PatientComponent } from './registration/patient.component';
import { PatientListComponent } from './patient-list/patient-list.component';
import { PatientDeactivateGuard } from './shared/patient-deactivate-guard';

import { PatientHistoryComponent } from './patient-history/patient-hisotry.component';
import { PatientHealthCardComponent } from './health-card/patient-health-card.component';
import { PatientNeighbourCardComponent } from './neighbour-card/patient-neighbour-card.component';

////////for grid implementation
//import { AgGridModule } from 'ag-grid-angular/main';
//import { PatientGridComponent } from '../shared/danphe-grid/danphe-grid.component';
import { SharedModule } from "../shared/shared.module";

import { PatientsDashboardComponent } from "../dashboards/patients/patients-dashboard.component";
import { QRCodeModule } from 'angular2-qrcode';

//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { PatientProfilePicComponent } from './registration/profile-pic.component';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { PatientSharedModule } from './patient-shared.module';
import { PatientDuplicateWarningBox } from './duplicate-warning/patient-duplicate-warning-box.component';
//import { ImageCropperModule } from 'ngx-image-cropper';
//import { WebcamModule } from 'ngx-webcam';

@NgModule({
  providers: [PatientDeactivateGuard,
    PatientsDLService,
    PatientsBLService,
    AppointmentDLService,
    VisitDLService,
    ImagingDLService,
    ClinicalDLService,
    AdmissionDLService,
    LabsDLService
  ],

  imports: [
    RouterModule.forChild(PatientsRoutingConstant),
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    //AgGridModule.forRoot(),
    HttpClientModule,
    SharedModule,
    QRCodeModule,
    ///  Ng2AutoCompleteModule,
    //WebcamModule,
    //ImageCropperModule
    DanpheAutoCompleteModule,
    PatientSharedModule
  ],

  declarations: [
    PatientsMainComponent,
    PatientComponent,
    PatientRegistrationMainComponent,
    PatientListComponent,
    AddressComponent,
    GuarantorComponent,
    InsuranceInfoComponent,
    KinEmergencyContactComponent,
    PatientsDashboardComponent,
    PatientHistoryComponent,
    PatientHealthCardComponent,
    PatientNeighbourCardComponent,
    PatientProfilePicComponent,
    //PatientDuplicateWarningBox
    //PatientGridComponent
  ],

  bootstrap: []
})
export class PatientsModule { }
