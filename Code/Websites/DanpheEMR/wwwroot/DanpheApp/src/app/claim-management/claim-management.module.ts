import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgxPaginationModule } from 'ngx-pagination';
import { ADT_DLService } from '../adt/shared/adt.dl.service';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';
import { VisitBLService } from '../appointments/shared/visit.bl.service';
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { BillingPrintSharedModule } from '../billing/print-pages/billing-print-shared.module';
import { BillingBLService } from '../billing/shared/billing.bl.service';
import { PharmacyBLService } from '../pharmacy/shared/pharmacy.bl.service';
import { PharmacyDLService } from '../pharmacy/shared/pharmacy.dl.service';
import { PharmacyService } from '../pharmacy/shared/pharmacy.service';
import { SettingsSharedModule } from '../settings-new/settings-shared.module';
import { SharedModule } from '../shared/shared.module';
import { InsuranceBillAssignClaimCodeComponent } from './bill-review/ins-bill-assign-claim-code.component';
import { InsuranceBillListComponent } from './bill-review/ins-bill-list.component';
import { InsBillPreviewComponent } from './bill-review/ins-bill-preview.component';
import { ClaimFormsComponent } from './claim-forms/claim-forms.component';
import { EchsMrpDrugCertificateComponent } from './claim-forms/echs-mrp-drug-certificate/echs-mrp-drug-certificate.component';
import { FormSelectionComponent } from './claim-forms/form-selection/form-selection.component';
import { MedicalClaimFormComponent } from './claim-forms/medicare-claim-form/medical-claim-form.component';
import { ClaimManagementMainComponent } from './claim-management-main.component';
import { ClaimManagementRoutingModule } from './claim-management-routing.module';
import { NewInsurancePaymentComponent } from './payment-processing/new-payment.component';
import { PaymentProcessingComponent } from './payment-processing/payment.component';
import { ViewPaymentComponent } from './payment-processing/view-payment/view-payment.component';
import { ReportsComponent } from './reports/reports.component';
import { InsuranceClaimsPreviewComponent } from './scrubbing/ins-claim-preview.component';
import { InsuranceClaimScrubbingComponent } from './scrubbing/ins-claim-scrubbing.component';
import { InsuranceClaimsListComponent } from './scrubbing/ins-claims-list.component';
import { InsuranceProviderSelectionComponent } from './select-insurance-provider/ins-provider-selection.component';
import { ClaimManagementBLService } from './shared/claim-management.bl.service';
import { ClaimManagementDLService } from './shared/claim-management.dl.service';
import { DocumentUploadComponent } from './shared/document-upload/document-upload.component';
import { EchsMrpDrugCertificatePrintComponent } from './shared/echs-mrp-drug-certificate-print/echs-mrp-drug-certificate-print.component';
import { InsuranceSelectionGuardService } from './shared/insurance-provider-selection-guard';
import { MedicalClaimFormPrintComponent } from './shared/medical-claim-form-print/medical-claim-form-print.component';
import { SsfClaimSelectionGuardService } from './shared/ssf-claim-selection-guard';
import { SSFClaimComponent } from './ssf-claim/ssf-claim.component';
import { SsfDlService } from './ssf-claim/ssf-dl.services';


@NgModule({
  providers: [
    ClaimManagementDLService,
    ClaimManagementBLService,
    InsuranceSelectionGuardService,
    BillingBLService,
    AppointmentDLService,
    VisitDLService,
    ADT_DLService,
    PharmacyService,
    PharmacyBLService,
    PharmacyDLService,
    VisitBLService,
    SsfDlService,
    SsfClaimSelectionGuardService
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    ClaimManagementRoutingModule,
    SharedModule,
    NgxPaginationModule,
    SettingsSharedModule,
    BillingPrintSharedModule
  ],
  declarations: [
    ClaimManagementMainComponent,
    InsuranceProviderSelectionComponent,
    InsuranceBillListComponent,
    InsuranceBillAssignClaimCodeComponent,
    InsuranceClaimsListComponent,
    InsuranceClaimsPreviewComponent,
    InsuranceClaimScrubbingComponent,
    InsuranceClaimsListComponent,
    PaymentProcessingComponent,
    ReportsComponent,
    DocumentUploadComponent,
    NewInsurancePaymentComponent,
    InsBillPreviewComponent,
    ClaimFormsComponent,
    FormSelectionComponent,
    EchsMrpDrugCertificateComponent,
    MedicalClaimFormComponent,
    EchsMrpDrugCertificatePrintComponent,
    MedicalClaimFormPrintComponent,
    ViewPaymentComponent,
    SSFClaimComponent
  ],
  bootstrap: []
})
export class ClaimManagementModule { }
