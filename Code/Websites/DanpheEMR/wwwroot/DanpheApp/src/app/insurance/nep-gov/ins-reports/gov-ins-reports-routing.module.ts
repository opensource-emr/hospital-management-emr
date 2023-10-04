import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { AuthGuardService } from '../../../security/shared/auth-guard.service';
import { GOVINSIncomeSegregationComponent } from './gov-income-segregation/gov-ins-income-segregation.component';
import { GovInsuranceReportsComponent } from './gov-ins-reports-main.component';
import { GOVINSPatientWiseClaimsComponent } from './gov-patient-wise-claims/gov-ins-patient-wise-claims.component';
import { GOVINSTotalItemsBillComponent } from './gov-total-items-bill/gov-ins-total-items-bill.component';


export const routes =
  [
    {
      path: '', component: GovInsuranceReportsComponent, canActivate: [AuthGuardService]
    },
    { path: 'GovInsTotalItemsBill', component: GOVINSTotalItemsBillComponent },
    { path: 'GovInsIncomeSegregation', component: GOVINSIncomeSegregationComponent },
    { path: 'GovInsPatientWiseClaims', component: GOVINSPatientWiseClaimsComponent }
  ]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GovInsuranceReportsRoutingModule {

}
