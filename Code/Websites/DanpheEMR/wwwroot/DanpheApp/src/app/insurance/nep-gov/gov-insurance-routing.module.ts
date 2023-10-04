import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { PageNotFound } from '../../404-error/404-not-found.component';
import { AuthGuardService } from '../../security/shared/auth-guard.service';
import { ResetPatientcontextGuard } from '../../shared/reset-patientcontext-guard';
import { ActivateBillingCounterGuardService } from '../../utilities/shared/activate-billing-counter-guard-service';
import { InsuranceComponent } from './gov-insurance-main.component';
import { GovInsBillingRequestComponent } from './ins-billing-request/gov-ins-billing-request.component';
import { GovINSIPDBillingComponent } from './ins-ipd-billing/gov-ins-ipd-billing-patient-list.component';
import { GovINSPatientListComponent } from './ins-patient/gov-ins-patient-list.component';
import { GovInsuranceVisitMainComponent } from './ins-visit/ins-new-visit/ins-new-visit-main.component';
import { GovINSVisitListComponent } from './ins-visit/ins-visit-list.component';

const routes: Routes = [
  {
    path: '',
    component: InsuranceComponent, canActivate: [AuthGuardService],

    children: [
      { path: '', redirectTo: 'Patient', pathMatch: 'full' },
      { path: 'Patient', component: GovINSPatientListComponent, canActivate: [AuthGuardService, ActivateBillingCounterGuardService] },
      { path: 'Visit', component: GovINSVisitListComponent, canActivate: [AuthGuardService, ActivateBillingCounterGuardService] },
      { path: 'IPDBilling', component: GovINSIPDBillingComponent, canActivate: [AuthGuardService], canDeactivate: [ResetPatientcontextGuard] },
      { path: 'Reports', loadChildren: './ins-reports/gov-ins-reports.module#InsuranceReportsModule', canActivate: [AuthGuardService] },
      { path: 'InsNewVisit', component: GovInsuranceVisitMainComponent },
      { path: 'BillingRequest', component: GovInsBillingRequestComponent, canDeactivate: [ResetPatientcontextGuard] },
      { path: "**", component: PageNotFound }

    ]
  },
  { path: "**", component: PageNotFound }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GovInsuranceRoutingModule { }
