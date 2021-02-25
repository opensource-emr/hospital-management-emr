import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { AppointmentsMainComponent } from './appointments-main.component';
import { AppointmentCreateComponent } from './appt-new/appointment-create.component';
import { AppointmentListComponent } from './appt-list/appointment-list.component';
import { VisitListComponent } from '../appointments/list-visit/visit-list.component';
import { PatientSearchComponent } from './patient-search/patient-search.component';
import { ResetPatientcontextGuard } from '../shared/reset-patientcontext-guard';
import { VisitMainComponent } from '../appointments/visit/visit-main.component';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { PageNotFound } from '../404-error/404-not-found.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',//this is : '/Appointment'
        component: AppointmentsMainComponent, canActivate: [AuthGuardService], canDeactivate: [ResetPatientcontextGuard],
        children: [
          { path: '', redirectTo: 'PatientSearch', pathMatch: 'full' },
          { path: 'Visit', component: VisitMainComponent, canDeactivate: [ResetPatientcontextGuard] },
          { path: 'ListAppointment', component: AppointmentListComponent, canActivate: [AuthGuardService] },//
          { path: 'CreateAppointment', component: AppointmentCreateComponent, canActivate: [AuthGuardService] },
          { path: 'ListVisit', component: VisitListComponent, canActivate: [AuthGuardService] },
          { path: 'PatientSearch', component: PatientSearchComponent, canActivate: [AuthGuardService] },
          { path: "**", component: PageNotFound },
        ]
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class AppointmentsRoutingModule {

}
