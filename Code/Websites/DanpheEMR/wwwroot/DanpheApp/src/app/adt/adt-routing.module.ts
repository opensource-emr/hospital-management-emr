
import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ADTMainComponent } from './adt-main.component';
import { AdtHomeComponent } from './adt-home.component';
import { AdmissionCreateComponent } from './admission/adm-create/admission-create.component';
import { AdmissionSearchPatient } from './admission/search-patient/admission-search-patient.component';
import { AdmittedListComponent } from './admission/adm-list/admitted-list.component';
import { DischargedListComponent } from './discharge/discharge-list.component';
import { ResetPatientcontextGuard } from '../shared/reset-patientcontext-guard';
import { AdmissionSelectPatientCanActivateGuard } from './shared/admission-select-patient-canactivate-guard';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { PageNotFound } from '../404-error/404-not-found.component';



@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ADTMainComponent,
        children: [
          { path: '', redirectTo: 'AdmissionSearchPatient', pathMatch: 'full' },
          { path: 'AdmissionSearchPatient', component: AdmissionSearchPatient, canActivate: [AuthGuardService] },
          { path: 'CreateAdmission', component: AdmissionCreateComponent, canDeactivate: [ResetPatientcontextGuard], canActivate: [AuthGuardService, AdmissionSelectPatientCanActivateGuard] },
          { path: 'AdmittedList', component: AdmittedListComponent, canActivate: [AuthGuardService] },
          { path: 'DischargedList', component: DischargedListComponent, canActivate: [AuthGuardService] },
          { path: 'AdtHome', component: AdtHomeComponent },
          { path: "**", component: PageNotFound },
          //{ path: 'Admission', component: ADTMainComponent ,canActivate: [AuthGuardService] },
        ]
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})
export class ADTRoutingModule {

}
