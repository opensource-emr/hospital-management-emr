import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete';
import { SharedModule } from '../../shared/shared.module';
import { BillingSharedModule } from '../billing-shared.module';
import { InsuranceBillItemRequest } from './add-new-items/insurance-bill-item-request.component';
import { INSBillingTransactionComponent } from './billing/ins-billing-transaction.component';
import { InsuranceSettlementsComponent } from './claims/insurance.settlements.component';
import { INSBillingMainComponent } from './ins-billing-main.component';
import { INSPatientRegistrationComponent } from './patient-add/ins-patient-registration.component';
import { InsurancePatientListComponent } from './patient-list/ins-patient-list.component';
import { INSProvisionalBillingComponent } from './provisional-billing/ins-provisional-billing.component';
import { GovInsuranceBLService } from './shared/gov-ins.bl.service';
import { GovInsuranceDLService } from './shared/gov-ins.dl.service';
import { UpdateInsuranceBalanceComponent } from './update-balance/update-insurance-balance.component';
//import { InsuranceReportsMainComponent } from './reports/ins-reports-main.component';
import { AuthGuardService } from '../../security/shared/auth-guard.service';
//import { INSTotalItemsBillComponent } from './reports/total-items-bill/ins-total-items-bill.component';
//import { INSIncomeSegregationComponent } from './reports/income-segregation/ins-income-segregation.component';
import { PatientSharedModule } from '../../patients/patient-shared.module';
import { ReportingService } from '../../reporting/shared/reporting-service';
import { ResetPatientcontextGuard } from '../../shared/reset-patientcontext-guard';
import { ActivateBillingCounterGuardService } from '../../utilities/shared/activate-billing-counter-guard-service';

export const InsBillingRoutes =
  [
    {
      path: '',
      component: INSBillingMainComponent,
      children: [
        { path: '', redirectTo: 'PatientList', pathMatch: 'full' },
        { path: 'PatientList', component: InsurancePatientListComponent },
        { path: 'InsBillingTransaction', component: INSBillingTransactionComponent },
        { path: 'InsProvisional', component: INSProvisionalBillingComponent },
        { path: 'Claims', component: InsuranceSettlementsComponent },
        { path: 'Reports', loadChildren: '../ins-billing/reports/ins-billing-reports.module#InsBillingReportsModule' }
      ]
      , canActivate: [AuthGuardService, ResetPatientcontextGuard, ActivateBillingCounterGuardService]
      //{ path: 'Reports/TotalItemsBill', component: INSTotalItemsBillComponent, canActivate: [AuthGuardService] },
      //{ path: 'Reports/IncomeSegregation', component: INSIncomeSegregationComponent, canActivate: [AuthGuardService] }]
    }
  ]



@NgModule({

  providers: [
    GovInsuranceDLService,
    GovInsuranceBLService,
    ReportingService
  ],

  imports: [
    SharedModule,
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    RouterModule.forChild(InsBillingRoutes),
    DanpheAutoCompleteModule,
    FormsModule,
    BillingSharedModule,
    PatientSharedModule
  ],
  declarations: [
    INSBillingMainComponent,
    InsurancePatientListComponent,
    UpdateInsuranceBalanceComponent,
    INSBillingTransactionComponent,
    INSProvisionalBillingComponent,
    InsuranceSettlementsComponent,
    InsuranceBillItemRequest,
    INSPatientRegistrationComponent,
    //InsuranceReportsMainComponent,
    //INSTotalItemsBillComponent,
    //INSIncomeSegregationComponent
  ],
  bootstrap: []
})
export class InsuranceBillingModule {


} 
