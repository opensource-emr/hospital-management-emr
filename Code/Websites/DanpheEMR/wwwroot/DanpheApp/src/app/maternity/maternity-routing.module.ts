import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { PageNotFound } from '../404-error/404-not-found.component';
import { MaternityMainComponent } from './maternity-main.component';
import { MaternityPatientListComponent } from './patient-list/maternity-patient-list.component';
import { MaternityPaymentsComponent } from './payments/maternity-payments.main.component';
import { Maternity_PatientListComponent } from './payments/patient-list/mat-payment-patient-list.component';
import { MaternityPatientPaymentComponent } from './payments/maternity-patient-payment/maternity-patient-payment.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: MaternityMainComponent,
        children: [
          { path: '', redirectTo: 'PatientList', pathMatch: 'full' },
          { path: 'PatientList',component: MaternityPatientListComponent, canActivate: [AuthGuardService]},
          { path: 'Payments',component: MaternityPaymentsComponent,
            children: [
              { path: '', redirectTo: 'PaymentPatientList', pathMatch: 'full' },
              { path: 'PaymentPatientList', component: Maternity_PatientListComponent },
              { path: 'PaymentDetails', component: MaternityPatientPaymentComponent},
              { path: "**", component: PageNotFound }
            ]
          },
          { path: 'Reports', loadChildren: './reports/maternity-reports.module#MaternityReportsModule', canActivate: [AuthGuardService] },
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
