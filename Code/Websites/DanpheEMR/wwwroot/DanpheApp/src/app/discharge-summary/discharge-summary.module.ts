
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { BillingDLService } from '../billing/shared/billing.dl.service';
import { LabsDLService } from '../labs/shared/labs.dl.service';
import { PatientsBLService } from '../patients/shared/patients.bl.service';
import { PatientsDLService } from '../patients/shared/patients.dl.service';
import { ImagingDLService } from '../radiology/shared/imaging.dl.service';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete';
import { SharedModule } from "../shared/shared.module";
import { DischargeSummaryComponent } from './discharge-summary.component';
import { DischargeSummaryBLService } from './shared/discharge-summary.bl.service';
import { DischargeSummaryDLService } from './shared/discharge-summary.dl.service';
import { BirthCertificateGenerateComponent } from './shared/generate-certificate/generate-birth-certificate.component';
import { DeathCertificateComponent } from "./shared/generate-certificate/generate-death-certificate.component";
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
    DischargeSummaryComponent,
    DeathCertificateComponent,
    BirthCertificateGenerateComponent,
  ],
  exports: [],
  bootstrap: []
})
export class DischargeSummaryModule { }
