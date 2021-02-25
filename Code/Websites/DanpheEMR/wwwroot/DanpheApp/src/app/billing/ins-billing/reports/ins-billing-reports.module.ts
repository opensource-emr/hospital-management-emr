import { NgModule } from '@angular/core';
import { Routes, RouterModule, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { InsuranceReportsMainComponent } from './ins-reports-main.component';
import { INSTotalItemsBillComponent } from './total-items-bill/ins-total-items-bill.component';
import { INSIncomeSegregationComponent } from './income-segregation/ins-income-segregation.component';
import { ReportingService } from '../../../reporting/shared/reporting-service';
import { SharedModule } from '../../../shared/shared.module';
import { GovInsuranceDLService } from '../shared/gov-ins.dl.service';
import { GovInsuranceBLService } from '../shared/gov-ins.bl.service';
import { DanpheAutoCompleteModule } from '../../../shared/danphe-autocomplete';


export const InsBillingReportsRoutes =
  [
    {
      path: '', component: InsuranceReportsMainComponent
    },
    { path: 'TotalItemsBill', component: INSTotalItemsBillComponent },
    { path: 'IncomeSegregation', component: INSIncomeSegregationComponent }
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
    RouterModule.forChild(InsBillingReportsRoutes),
    FormsModule,
    DanpheAutoCompleteModule
  ],
  declarations: [
    InsuranceReportsMainComponent,
    INSTotalItemsBillComponent,
    INSIncomeSegregationComponent
  ],
  bootstrap: []
})
export class InsBillingReportsModule {


} 
