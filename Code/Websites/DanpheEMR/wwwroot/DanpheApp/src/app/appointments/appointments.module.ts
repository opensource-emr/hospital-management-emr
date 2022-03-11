
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";

import { AppointmentsRoutingModule } from "./appointments-routing.module";

//Visit
import { VisitBLService } from './shared/visit.bl.service';
import { VisitDLService } from './shared/visit.dl.service';
import { VisitListComponent } from "../appointments/list-visit/visit-list.component";
//import { VisitComponent } from '../appointments/visit/visit.component';
import { TransferVisitComponent } from './transfer/transfer-visit.component';
import { FollowUpVisitComponent } from './follow-up/followup-visit.component';
//Appointment components
import { AppointmentBLService } from './shared/appointment.bl.service';
import { AppointmentDLService } from './shared/appointment.dl.service';
import { AppointmentsMainComponent } from './appointments-main.component';
import { AppointmentCreateComponent } from './appt-new/appointment-create.component';
import { AppointmentListComponent } from './appt-list/appointment-list.component';

import { PatientSearchComponent } from './patient-search/patient-search.component';
//Admission
//import { AdmissionCreateComponent } from '../appointments/admission/admission-create.component';

import { PatientsDLService } from '../patients/shared/patients.dl.service';
import { BillingDLService } from '../billing/shared/billing.dl.service';
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { SharedModule } from "../shared/shared.module";
import { VisitMainComponent } from './visit/visit-main.component';
import { VisitPatientInfoComponent } from './visit/visit-patient-info.component';
import { VisitInfoComponent } from './visit/visit-info.component';
import { VisitBillingInfoComponent } from './visit/visit-billing-info.component';
import { ADT_DLService } from '../adt/shared/adt.dl.service';
import { FreeReferalVisitComponent } from './referral/free-referral-visit.component';
import { PatientSharedModule } from '../patients/patient-shared.module';
import { SettingsSharedModule } from '../settings-new/settings-shared.module';
import { BillingSharedModule } from '../billing/billing-shared.module';
import { BillingPrintSharedModule } from '../billing/print-pages/billing-print-shared.module';

@NgModule({
  providers: [AppointmentDLService,
    AppointmentBLService,
    VisitBLService,
    VisitDLService,
    BillingDLService,
    PatientsDLService,
    ADT_DLService,
    { provide: LocationStrategy, useClass: HashLocationStrategy }],
  imports: [AppointmentsRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    //AgGridModule.forRoot(),
    DanpheAutoCompleteModule,
    SharedModule,
    PatientSharedModule,
    SettingsSharedModule,
    BillingSharedModule,
    BillingPrintSharedModule
  ],
  declarations: [
    AppointmentsMainComponent,
    AppointmentCreateComponent,
    AppointmentListComponent,
    VisitListComponent,
    TransferVisitComponent,
    FollowUpVisitComponent,
    PatientSearchComponent,
    VisitMainComponent,
    VisitPatientInfoComponent,
    VisitInfoComponent,
    VisitBillingInfoComponent,
    FreeReferalVisitComponent, //sud:3Jun'19--Needed for Free referel, paid referal is handled by normal flow.

  ],
  bootstrap: []//do we need anything here ? <sudarshan:2jan2017>
})
export class AppointmentsModule { }
