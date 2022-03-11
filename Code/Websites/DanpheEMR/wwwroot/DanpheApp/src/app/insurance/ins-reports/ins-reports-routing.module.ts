import { NgModule } from '@angular/core';
import { RouterModule,Routes } from "@angular/router";
import { GOVINSIncomeSegregationComponent } from './gov-income-segregation/gov-ins-income-segregation.component';
import { GOVINSTotalItemsBillComponent } from './gov-total-items-bill/gov-ins-total-items-bill.component';
import { IncuranceReportsComponent } from './ins-reports-main.component';
import { AuthGuardService } from '../../security/shared/auth-guard.service';
import { GOVINSPatientWiseClaimsComponent } from './gov-patient-wise-claims/gov-ins-patient-wise-claims.component';


export const routes =
  [
    {
      path: '', component: IncuranceReportsComponent, canActivate: [AuthGuardService]
    },
    { path: 'GovInsTotalItemsBill', component: GOVINSTotalItemsBillComponent },
    { path: 'GovInsIncomeSegregation', component: GOVINSIncomeSegregationComponent },
    { path: 'GovInsPatientWiseClaims', component: GOVINSPatientWiseClaimsComponent }
  ]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class IncuranceReportsRoutingModule {

}
