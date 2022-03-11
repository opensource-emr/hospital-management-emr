import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFound } from '../404-error/404-not-found.component';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { InsBillingRequestComponent } from './ins-billing-request/ins-billing-request.component';
import { INSIPDBillingComponent } from './ins-ipd-billing/ins-ipd-billing-patient-list.component';
import { INSPatientRegistrationComponent } from './ins-patient/ins-patient-registration/ins-patient-registration.component';
import { INSPatientListComponent } from './ins-patient/ins-patient-list.component';
import { InsuranceVisitMainComponent } from './ins-visit/ins-new-visit/ins-new-visit-main.component';
import { INSVisitListComponent } from './ins-visit/ins-visit-list.component';
import { InsuranceComponent } from './insurance.component';
import { ResetPatientcontextGuard } from '../shared/reset-patientcontext-guard';

const routes: Routes = [
  {
    path: '',
    component: InsuranceComponent, canActivate: [AuthGuardService],

    children: [
      { path: '', redirectTo: 'Patient', pathMatch: 'full' },
      { path: 'Patient', component: INSPatientListComponent, canActivate: [AuthGuardService] },
      { path: 'Visit', component: INSVisitListComponent, canActivate: [AuthGuardService] },
      { path: 'IPDBilling', component: INSIPDBillingComponent, canActivate: [AuthGuardService], canDeactivate: [ResetPatientcontextGuard] },
      { path: 'Reports', loadChildren: './ins-reports/ins-reports.module#InsuranceReportsModule', canActivate: [AuthGuardService] },
      { path: 'InsNewVisit', component: InsuranceVisitMainComponent },
      { path: 'BillingRequest', component: InsBillingRequestComponent, canDeactivate: [ResetPatientcontextGuard] },
      { path: "**", component: PageNotFound }

    ]
  },
  { path: "**", component: PageNotFound }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class InsuranceRoutingModule { }
