import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';
import { ADT_BLService } from './shared/adt.bl.service';
import { ADT_DLService } from './shared/adt.dl.service';

import { RegistrationSchemeSharedModule } from '../appointments/shared/registration-scheme/registration-scheme-shared.module';
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { BillingSharedModule } from '../billing/billing-shared.module';
import { BillingDLService } from '../billing/shared/billing.dl.service';
import { IOAllergyVitalsBLService } from '../clinical/shared/io-allergy-vitals.bl.service';
import { DischargeSummaryModule } from '../discharge-summary/discharge-summary.module';
import { LabsDLService } from '../labs/shared/labs.dl.service';
import { PatientsBLService } from '../patients/shared/patients.bl.service';
import { PatientsDLService } from '../patients/shared/patients.dl.service';
import { ImagingDLService } from '../radiology/shared/imaging.dl.service';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { SharedModule } from '../shared/shared.module';
import { AdmissionReserveComponent } from './admission/adm-reserve/admission-reserve.component';
import { AdmissionSlipComponent } from './admission/admission-slip/admission-slip.component';
import { DischargeSlipComponent } from './discharge/discharge-slip/discharge-slip.component';
import { AdmittedPatientHistory } from './patient-history/admitted-patient-history.component';
import { AdmissionMasterBlService } from './shared/admission-master.bl.service';
import { AdmissionMasterDlService } from './shared/admission-master.dl.service';
import { TransferComponent } from './transfer/transfer.component';


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
    IOAllergyVitalsBLService,
    AdmissionMasterBlService,
    AdmissionMasterDlService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule, SharedModule,
    DischargeSummaryModule,
    DanpheAutoCompleteModule,
    RegistrationSchemeSharedModule,
    BillingSharedModule
  ],
  declarations: [
    AdmissionReserveComponent,
    TransferComponent,
    AdmittedPatientHistory,
    AdmissionSlipComponent,
    DischargeSlipComponent
  ],
  exports: [AdmissionReserveComponent,
    TransferComponent,
    AdmittedPatientHistory,
    AdmissionSlipComponent,
    DischargeSlipComponent],
  bootstrap: []
})
export class ADTSharedModule { }
