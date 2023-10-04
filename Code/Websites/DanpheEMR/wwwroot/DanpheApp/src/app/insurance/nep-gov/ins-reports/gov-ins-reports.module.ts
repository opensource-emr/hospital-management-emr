import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ReportingService } from '../../../reporting/shared/reporting-service';
import { DanpheAutoCompleteModule } from '../../../shared/danphe-autocomplete';
import { SharedModule } from '../../../shared/shared.module';
import { InsPatientClaimDetailsView } from '../shared/ins-pat-claim-details-view/ins-pat-claim-details-view.component';
import { GovInsuranceService } from '../shared/ins-service';
import { GovInsuranceBlService } from '../shared/insurance.bl.service';
import { GovInsuranceDlService } from '../shared/insurance.dl.service';
import { GOVINSIncomeSegregationComponent } from './gov-income-segregation/gov-ins-income-segregation.component';
import { GovInsuranceReportsComponent } from './gov-ins-reports-main.component';
import { GovInsuranceReportsRoutingModule } from './gov-ins-reports-routing.module';
import { GOVINSPatientWiseClaimsComponent } from './gov-patient-wise-claims/gov-ins-patient-wise-claims.component';
import { GOVINSTotalItemsBillComponent } from './gov-total-items-bill/gov-ins-total-items-bill.component';



@NgModule({

  providers: [
    GovInsuranceDlService,
    GovInsuranceBlService,
    GovInsuranceService,
    ReportingService
  ],

  imports: [
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    GovInsuranceReportsRoutingModule,
    FormsModule,
    DanpheAutoCompleteModule,
    SharedModule
  ],
  declarations: [
    GovInsuranceReportsComponent,
    GOVINSTotalItemsBillComponent,
    GOVINSIncomeSegregationComponent,
    GOVINSPatientWiseClaimsComponent,
    InsPatientClaimDetailsView
  ],
  bootstrap: [GovInsuranceReportsComponent]
})
export class InsuranceReportsModule {


} 
