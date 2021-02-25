
import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { SharedModule } from "../shared/shared.module";
import { DischargeSummaryAddComponent } from '../discharge-summary/add-view-summary/discharge-summary-add.component';
import { DischargeSummaryViewComponent } from '../discharge-summary/add-view-summary/discharge-summary-view.component';
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';
import { PatientsBLService } from '../patients/shared/patients.bl.service';
import { PatientsDLService } from '../patients/shared/patients.dl.service';
import { ImagingDLService } from '../radiology/shared/imaging.dl.service';
import { LabsDLService } from '../labs/shared/labs.dl.service';
import { BillingDLService } from '../billing/shared/billing.dl.service';
import { DischargeSummaryBLService } from './shared/discharge-summary.bl.service';
import { DischargeSummaryDLService } from './shared/discharge-summary.dl.service';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete';
import { DischargeSummaryComponent } from './discharge-summary.component';
import { DeathCertificateComponent } from "./shared/generate-certificate/generate-death-certificate.component";
import { BirthCertificateGenerateComponent } from './shared/generate-certificate/generate-birth-certificate.component';
@NgModule({
  providers: [
    DischargeSummaryBLService,
    DischargeSummaryDLService,
    VisitDLService,
    AppointmentDLService,
    PatientsBLService,
    PatientsDLService,
    ImagingDLService,
    LabsDLService,
    BillingDLService
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    SharedModule,
    DanpheAutoCompleteModule,
  ],
  declarations: [
    //DischargeSummaryAddComponent,
    //DischargeSummaryViewComponent,
    DischargeSummaryComponent,
    DeathCertificateComponent,
    BirthCertificateGenerateComponent
  ],
  exports: [],
  bootstrap: []
})
export class DischargeSummaryModule { }
