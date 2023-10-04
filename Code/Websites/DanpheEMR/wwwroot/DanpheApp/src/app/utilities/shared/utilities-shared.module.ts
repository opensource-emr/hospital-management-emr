import { CommonModule } from "@angular/common";
import { HttpClientModule } from "@angular/common/http";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { BillingSharedModule } from "../../billing/billing-shared.module";
import { SharedModule } from "../../shared/shared.module";
import { PrintOrganizationDepositComponent } from "../organization-deposit/print-pages/print-organization-deposit.component";
import { ProcessConfirmationComponent } from "./process-confirmation/process-confirmation.component";
import { UtilitiesBLService } from "./utilities.bl.service";
import { UtilitiesDLService } from "./utilities.dl.service";


@NgModule({
  providers: [
    UtilitiesBLService,
    UtilitiesDLService,

  ],
  imports: [
    ReactiveFormsModule,
    FormsModule,
    CommonModule,
    HttpClientModule,
    SharedModule,
    BillingSharedModule,

  ],
  declarations: [
    PrintOrganizationDepositComponent,
    ProcessConfirmationComponent

  ],
  exports: [
    PrintOrganizationDepositComponent,
    ProcessConfirmationComponent
  ],
  bootstrap: []
})
export class UtilitiesSharedModule { }
