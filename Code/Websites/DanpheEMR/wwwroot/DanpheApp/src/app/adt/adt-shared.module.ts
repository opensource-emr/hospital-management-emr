import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { ADT_BLService } from './shared/adt.bl.service';
import { ADT_DLService } from './shared/adt.dl.service';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';

import { PatientsBLService } from '../patients/shared/patients.bl.service';
import { PatientsDLService } from '../patients/shared/patients.dl.service';
import { ImagingDLService } from '../radiology/shared/imaging.dl.service';
import { LabsDLService } from '../labs/shared/labs.dl.service';
import { BillingDLService } from '../billing/shared/billing.dl.service';
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { IOAllergyVitalsBLService } from '../clinical/shared/io-allergy-vitals.bl.service';
import { SharedModule } from '../shared/shared.module';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { AgGridModule } from 'ag-grid-angular/main';
import { AdmissionSelectPatientCanActivateGuard } from './shared/admission-select-patient-canactivate-guard';
import { DischargeSummaryModule } from '../discharge-summary/discharge-summary.module';
import { AdmissionReserveComponent } from './admission/adm-reserve/admission-reserve.component';
import { TransferComponent } from './transfer/transfer.component';
import { AdmittedPatientHistory } from './patient-history/admitted-patient-history.component';


@NgModule({
  providers: [
    ADT_DLService,
    ADT_BLService,
    VisitDLService,
    AppointmentDLService,
    PatientsBLService,
    PatientsDLService,
    ImagingDLService,
    LabsDLService,
    BillingDLService,
    IOAllergyVitalsBLService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule, SharedModule,
    DischargeSummaryModule,
    DanpheAutoCompleteModule],
  declarations: [
    AdmissionReserveComponent,
    TransferComponent,
    AdmittedPatientHistory
  ],
  exports: [AdmissionReserveComponent,
    TransferComponent,
    AdmittedPatientHistory],
  bootstrap: []
})
export class ADTSharedModule { }
