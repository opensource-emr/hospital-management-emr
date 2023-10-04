import { NgModule } from "@angular/core";
import { RouterModule } from "@angular/router";
import { PageNotFound } from "../404-error/404-not-found.component";
import { InsuranceBillListComponent } from "./bill-review/ins-bill-list.component";
import { ClaimFormsComponent } from "./claim-forms/claim-forms.component";
import { EchsMrpDrugCertificateComponent } from "./claim-forms/echs-mrp-drug-certificate/echs-mrp-drug-certificate.component";
import { FormSelectionComponent } from "./claim-forms/form-selection/form-selection.component";
import { MedicalClaimFormComponent } from "./claim-forms/medicare-claim-form/medical-claim-form.component";
import { ClaimManagementMainComponent } from "./claim-management-main.component";
import { PaymentProcessingComponent } from "./payment-processing/payment.component";
import { ReportsComponent } from "./reports/reports.component";
import { InsuranceClaimsListComponent } from "./scrubbing/ins-claims-list.component";
import { InsuranceProviderSelectionComponent } from "./select-insurance-provider/ins-provider-selection.component";
import { InsuranceSelectionGuardService } from "./shared/insurance-provider-selection-guard";
import { SsfClaimSelectionGuardService } from "./shared/ssf-claim-selection-guard";
import { SSFClaimComponent } from "./ssf-claim/ssf-claim.component";


@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: ClaimManagementMainComponent,
        children: [
          { path: '', redirectTo: 'BillReview', pathMatch: 'full' },
          { path: 'SelectInsuranceProvider', component: InsuranceProviderSelectionComponent },
          { path: 'BillReview', component: InsuranceBillListComponent, canActivate: [InsuranceSelectionGuardService] },
          { path: 'Scrubbing', component: InsuranceClaimsListComponent, canActivate: [InsuranceSelectionGuardService] },
          { path: 'PaymentProcessing', component: PaymentProcessingComponent, canActivate: [InsuranceSelectionGuardService] },
          { path: 'Reports', component: ReportsComponent, canActivate: [InsuranceSelectionGuardService] },
          {
            path: 'ClaimForms',
            component: ClaimFormsComponent,
            canActivate: [InsuranceSelectionGuardService],
            children: [
              { path: '', redirectTo: 'FormSelection', pathMatch: 'full' },
              { path: 'FormSelection', component: FormSelectionComponent },
              { path: 'EchsMrpDrugCertificate', component: EchsMrpDrugCertificateComponent },
              { path: 'MedicalClaim', component: MedicalClaimFormComponent }
            ]
          },
          { path: 'SSFClaim', component: SSFClaimComponent, canActivate: [SsfClaimSelectionGuardService] }
        ]
      },
      { path: "**", component: PageNotFound }

    ])
  ],
  exports: [
    RouterModule
  ]
})
export class ClaimManagementRoutingModule { }
