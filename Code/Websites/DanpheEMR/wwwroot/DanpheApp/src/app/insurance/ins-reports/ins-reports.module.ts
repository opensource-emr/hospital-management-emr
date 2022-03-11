import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { GOVINSTotalItemsBillComponent } from './gov-total-items-bill/gov-ins-total-items-bill.component';
import { GOVINSIncomeSegregationComponent } from './gov-income-segregation/gov-ins-income-segregation.component';
import { IncuranceReportsComponent } from './ins-reports-main.component';
import { InsuranceDlService } from '../shared/insurance.dl.service';
import { InsuranceBlService } from '../shared/insurance.bl.service';
import { InsuranceService } from '../shared/ins-service';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete';
import { IncuranceReportsRoutingModule } from './ins-reports-routing.module';
import { SharedModule } from '../../shared/shared.module';
import { ReportingService } from '../../reporting/shared/reporting-service';
import { GOVINSPatientWiseClaimsComponent } from './gov-patient-wise-claims/gov-ins-patient-wise-claims.component';
import { InsPatientClaimDetailsView } from '../shared/ins-pat-claim-details-view/ins-pat-claim-details-view.component';



@NgModule({

  providers: [
    InsuranceDlService,
    InsuranceBlService,
    InsuranceService,
    ReportingService
  ],

  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    IncuranceReportsRoutingModule,
    FormsModule,
    DanpheAutoCompleteModule,
    SharedModule
  ],
  declarations: [
    IncuranceReportsComponent,
    GOVINSTotalItemsBillComponent,
    GOVINSIncomeSegregationComponent,
    GOVINSPatientWiseClaimsComponent,
    InsPatientClaimDetailsView
  ],
  bootstrap: [IncuranceReportsComponent]
})
export class InsuranceReportsModule {


} 
