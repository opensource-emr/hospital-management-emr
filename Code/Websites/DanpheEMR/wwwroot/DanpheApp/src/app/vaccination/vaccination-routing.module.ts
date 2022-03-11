import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { PageNotFound } from '../404-error/404-not-found.component';
import { VaccinationMainComponent } from './vaccination-main.component';
import { VaccinationPatientListComponent } from './patient-list/vaccination-patient-list.component';
import { VaccinationReportComponent } from './reports/vaccination-report.main.component';
import { PatientVaccinationDetailReportComponent } from './reports/vaccination-detail-report/patient-vaccine-report.component';
import { PatientVaccinationAppointmentDetailsReportComponent } from './reports/vaccination-appointment-details-report/vaccination-appointment-details-report.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: VaccinationMainComponent,
        children: [
          { path: '', redirectTo: 'PatientList', pathMatch: 'full' },
          {
            path: 'PatientList',
            component: VaccinationPatientListComponent, canActivate: [AuthGuardService]
          },
          {
            path: 'Reports',
            component: VaccinationReportComponent, canActivate: [AuthGuardService],
            children: [
              { path: '', redirectTo: 'AppointmentDetailsReport', pathMatch: 'full' },
              {
                path: 'IntegratedReport',
                component: PatientVaccinationDetailReportComponent, canActivate: [AuthGuardService]
              },
              {
                path: 'AppointmentDetailsReport',
                component: PatientVaccinationAppointmentDetailsReportComponent, canActivate: [AuthGuardService]
              }
            ]
          },
          { path: "**", component: PageNotFound }

        ]
      },
      { path: "**", component: PageNotFound }
    ])
  ],
  exports: [
    RouterModule
  ]
})

export class MaternityRoutingModule {

}
