import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { ADT_DLService } from "../adt/shared/adt.dl.service";
import { AppointmentDLService } from "../appointments/shared/appointment.dl.service";
import { VisitDLService } from "../appointments/shared/visit.dl.service";
import { BillingSharedModule } from "../billing/billing-shared.module";
import { DanpheAutoCompleteModule } from "../shared/danphe-autocomplete";
import { SharedModule } from "../shared/shared.module";
import { SchemeRefundPrintComponent } from './Print/scheme-refund-print.component';
import { ChangeBillingCounterComponent } from './change-billing-counter/change-billing-counter.component';
import { ChangeSchemePriceCategoryComponent } from "./change-visit-scheme/change-scheme-price-category.component";
import { OrganizationDepositComponent } from './organization-deposit/organization-deposit/organization-deposit.component';
import { SchemeRefundListComponent } from "./scheme-refund/list/scheme-refund-list.component";
import { SchemeRefundComponent } from "./scheme-refund/new/scheme-refund.component";
import { UtilitiesSharedModule } from "./shared/utilities-shared.module";
import { UtilitiesBLService } from "./shared/utilities.bl.service";
import { UtilitiesDLService } from "./shared/utilities.dl.service";
import { UtilitiesService } from "./shared/utilities.service";
import { UtilitiesMainComponent } from "./utilities-main.component";
import { UtilitiesRoutingModule } from "./utilities-routing.module";

@NgModule({
  providers: [
    UtilitiesBLService,
    UtilitiesDLService,
    UtilitiesService,
    SchemeRefundComponent,
    VisitDLService,
    AppointmentDLService,
    ADT_DLService
  ],
  imports: [
    UtilitiesRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    SharedModule,
    DanpheAutoCompleteModule,
    BillingSharedModule,
    UtilitiesSharedModule

  ],
  declarations: [
    UtilitiesMainComponent,
    SchemeRefundComponent,
    SchemeRefundListComponent,
    ChangeSchemePriceCategoryComponent,
    ChangeBillingCounterComponent,
    OrganizationDepositComponent,
    SchemeRefundPrintComponent,
    //PrintOrganizationDepositComponent,

  ],
  bootstrap: []
})
export class UtilitiesModule { }
