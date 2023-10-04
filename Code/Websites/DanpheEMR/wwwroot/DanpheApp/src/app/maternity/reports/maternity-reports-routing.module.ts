import { NgModule } from '@angular/core';
import { RouterModule,Routes } from "@angular/router";
import { AuthGuardService } from '../../security/shared/auth-guard.service';
import { MaternityReportsMatAllowanceComponent } from './maternity-allowance-report/mat-allowance-report.component';
import { MaternityReportsComponent } from './maternity-reports.component';


export const routes =
  [
    {
      path: '', component: MaternityReportsComponent, canActivate: [AuthGuardService]
    },
    { path: 'MaternityAllowance', component: MaternityReportsMatAllowanceComponent },
  ]

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MaternityReportsRoutingModule {

}
