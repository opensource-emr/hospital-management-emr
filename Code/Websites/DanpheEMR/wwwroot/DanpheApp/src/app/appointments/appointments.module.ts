
import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppointmentsRoutingModule } from "./appointments-routing.module";

//Visit
import { VisitListComponent } from "../appointments/list-visit/visit-list.component";
import { VisitBLService } from './shared/visit.bl.service';
import { VisitDLService } from './shared/visit.dl.service';
//import { VisitComponent } from '../appointments/visit/visit.component';
import { FollowUpVisitComponent } from './follow-up/followup-visit.component';
import { TransferVisitComponent } from './transfer/transfer-visit.component';
//Appointment components
import { AppointmentsMainComponent } from './appointments-main.component';
import { AppointmentListComponent } from './appt-list/appointment-list.component';
import { AppointmentCreateComponent } from './appt-new/appointment-create.component';
import { AppointmentBLService } from './shared/appointment.bl.service';
import { AppointmentDLService } from './shared/appointment.dl.service';

import { PatientSearchComponent } from './patient-search/patient-search.component';
//Admission
//import { AdmissionCreateComponent } from '../appointments/admission/admission-create.component';

import { BillingDLService } from '../billing/shared/billing.dl.service';
import { PatientsDLService } from '../patients/shared/patients.dl.service';
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { NgxPaginationModule } from 'ngx-pagination';
import { ADT_DLService } from '../adt/shared/adt.dl.service';
import { BillingSharedModule } from '../billing/billing-shared.module';
import { BillingPrintSharedModule } from '../billing/print-pages/billing-print-shared.module';
import { InsuranceSharedModule } from '../insurance/shared/insurance-shared.module';
import { PatientSharedModule } from '../patients/patient-shared.module';
import { SettingsSharedModule } from '../settings-new/settings-shared.module';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { SharedModule } from "../shared/shared.module";
import { StickerSharedModule } from '../stickers/stickers-shared-module';
import { SSFClaimComponent } from './SSFClaim/SSFClaimComponent';
import { OnlineAppointmentCompletedListComponent } from './online-appointment/completed-list/online-appt-completed';
import { OnlineAppointmentMainComponent } from './online-appointment/online-appointment-main-component';
import { OnlineAppointmentPendingListComponent } from './online-appointment/pending-list/online-appt-pending';
import { FreeReferalVisitComponent } from './referral/free-referral-visit.component';
import { RegistrationSchemeSharedModule } from './shared/registration-scheme/registration-scheme-shared.module';
import { VisitBillingInfoComponent } from './visit/visit-billing-info.component';
import { VisitInfoComponent } from './visit/visit-info.component';
import { VisitMainComponent } from './visit/visit-main.component';
import { VisitPatientInfoComponent } from './visit/visit-patient-info.component';

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
    BillingPrintSharedModule,
    NgxPaginationModule,
    StickerSharedModule,
    InsuranceSharedModule,
    RegistrationSchemeSharedModule
  ],
  declarations: [
    AppointmentsMainComponent,
    AppointmentCreateComponent,
    AppointmentListComponent,
    VisitListComponent,
    TransferVisitComponent,
    FollowUpVisitComponent,
    PatientSearchComponent,
    //RegistrationSchemeSelectComponent,//sud:14March'23--Move this later to shared module if required.
    VisitMainComponent,
    VisitPatientInfoComponent,
    VisitInfoComponent,
    VisitBillingInfoComponent,
    FreeReferalVisitComponent, //sud:3Jun'19--Needed for Free referel, paid referal is handled by normal flow.
    OnlineAppointmentMainComponent,
    OnlineAppointmentCompletedListComponent,
    OnlineAppointmentPendingListComponent,
    SSFClaimComponent

  ],
  bootstrap: []
})
export class AppointmentsModule { }
