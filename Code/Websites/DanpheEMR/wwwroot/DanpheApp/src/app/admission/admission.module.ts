import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { AdmissionBLService } from './shared/admission.bl.service';
import { AdmissionDLService } from './shared/admission.dl.service';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';


import { PatientsBLService } from '../patients/shared/patients.bl.service';
import { PatientsDLService } from '../patients/shared/patients.dl.service';
import { ImagingDLService } from '../radiology/shared/imaging.dl.service';
import { LabsDLService } from '../labs/shared/labs.dl.service';
import { BillingDLService } from '../billing/shared/billing.dl.service';
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { IOAllergyVitalsBLService } from '../clinical/shared/io-allergy-vitals.bl.service';


import { AdmissionRoutingModule } from './admission-routing.module';
import { AdmissionComponent } from './admission.component';
import { AdmissionCreateComponent } from './admission/admission-create.component';
import { AdmissionSearchPatient } from './admission/admission-search-patient.component';
import { AdmittedListComponent } from './admission/admitted-list.component';
import { TransferComponent } from './transfer/transfer.component';
import { UpgradeComponent } from './upgrade/upgrade.component';
import { AdmissionCancelComponent } from './admission-cancel/admission-cancel.component';

import { DischargeSummaryAddComponent } from './discharge/discharge-summary-add.component';
import { DischargeSummaryViewComponent } from './discharge/discharge-summary-view.component';
import { DischargedListComponent } from './discharge/discharge-list.component';
import { ChangeDoctorComponent } from './change-doctor/change-doctor.component';
import { AdtHomeComponent } from './adt-home.component';
import { AdmissionPrintStickerComponent } from './admission-sticker/admission-print-sticker.component';
import { SharedModule } from '../shared/shared.module';
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { AgGridModule } from 'ag-grid-angular/main';
import { AdmissionSelectPatientCanActivateGuard } from './shared/admission-select-patient-canactivate-guard';
import { PatientBedHistory } from './patient-bed-history/patient-bed-history.component';
import { IPWristBandPrintComponent } from './ip-wrist-band/ip-wrist-band-print.component';
import { AdmittedPatientHistory } from './patient-history/admitted-patient-history.component';
import { DischargeSummaryModule } from '../discharge-summary/discharge-summary.module';
@NgModule({
    providers: [AdmissionBLService,
        AdmissionDLService,
        VisitDLService,
        AppointmentDLService,
        PatientsBLService,
        PatientsDLService,
        ImagingDLService,
        LabsDLService,
        BillingDLService,
        AdmissionSelectPatientCanActivateGuard,
        IOAllergyVitalsBLService],
    imports: [AdmissionRoutingModule,
        CommonModule,
        ReactiveFormsModule,
        HttpClientModule,
        AgGridModule.withComponents(AdmissionComponent),
        FormsModule, SharedModule, DischargeSummaryModule,
        DanpheAutoCompleteModule],
    declarations: [
        AdmissionComponent,
        AdmissionCreateComponent,
        AdmissionSearchPatient,
        AdmittedListComponent,
        TransferComponent,
        DischargeSummaryAddComponent,
        DischargeSummaryViewComponent,
        DischargedListComponent,
        UpgradeComponent,
        AdtHomeComponent,
        AdmissionPrintStickerComponent,
        PatientBedHistory,
        AdmissionCancelComponent,
        IPWristBandPrintComponent,
        ChangeDoctorComponent,
        AdmittedPatientHistory
    ],
    bootstrap: []//do we need anything here ? <sudarshan:2jan2017>
})
export class AdmissionModule { }
