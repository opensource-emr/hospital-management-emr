import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { PageNotFound } from '../404-error/404-not-found.component';
import { VisitListComponent } from '../appointments/list-visit/visit-list.component';
import { VisitMainComponent } from '../appointments/visit/visit-main.component';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { ResetPatientcontextGuard } from '../shared/reset-patientcontext-guard';
import { ActivateBillingCounterGuardService } from '../utilities/shared/activate-billing-counter-guard-service';
import { SSFClaimComponent } from './SSFClaim/SSFClaimComponent';
import { AppointmentsMainComponent } from './appointments-main.component';
import { AppointmentListComponent } from './appt-list/appointment-list.component';
import { AppointmentCreateComponent } from './appt-new/appointment-create.component';
import { OnlineAppointmentCompletedListComponent } from './online-appointment/completed-list/online-appt-completed';
import { OnlineAppointmentMainComponent } from './online-appointment/online-appointment-main-component';
import { OnlineAppointmentPendingListComponent } from './online-appointment/pending-list/online-appt-pending';
import { PatientSearchComponent } from './patient-search/patient-search.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',//this is : '/Appointment'
        component: AppointmentsMainComponent, canActivate: [AuthGuardService, ActivateBillingCounterGuardService], canDeactivate: [ResetPatientcontextGuard],
        children: [
          { path: '', redirectTo: 'PatientSearch', pathMatch: 'full' },
          { path: 'Visit', component: VisitMainComponent, canDeactivate: [ResetPatientcontextGuard] },
          { path: 'ListAppointment', component: AppointmentListComponent, canActivate: [AuthGuardService] },//
          { path: 'CreateAppointment', component: AppointmentCreateComponent, canActivate: [AuthGuardService] },
          { path: 'ListVisit', component: VisitListComponent, canActivate: [AuthGuardService] },
          { path: 'PatientSearch', component: PatientSearchComponent, canActivate: [AuthGuardService] },
          { path: 'SSFClaim', component: SSFClaimComponent, canActivate: [AuthGuardService] },
          {
            path: 'OnlineAppointment', component: OnlineAppointmentMainComponent, canActivate: [AuthGuardService],
            children: [
              {
                path: "",
                redirectTo: "PendingList",
                pathMatch: "full",
              },
              {
                path: "PendingList",
                component: OnlineAppointmentPendingListComponent,
                canActivate: [AuthGuardService]
              },
              {
                path: "CompletedList",
                component: OnlineAppointmentCompletedListComponent,
                canActivate: [AuthGuardService]
              },
              { path: "**", component: PageNotFound }
            ],
          },
          { path: "**", component: PageNotFound },
        ],
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class AppointmentsRoutingModule {

}
