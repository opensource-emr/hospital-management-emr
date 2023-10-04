import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';
import { NgModule } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BillingSharedModule } from '../../billing/billing-shared.module';
import { SettingsSharedModule } from '../../settings-new/settings-shared.module';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete';
import { SharedModule } from '../../shared/shared.module';
import { InsuranceComponent } from './gov-insurance-main.component';
import { GovInsuranceRoutingModule } from './gov-insurance-routing.module';
import { GovINSIPDBillingComponent } from './ins-ipd-billing/gov-ins-ipd-billing-patient-list.component';
import { GovINSPatientListComponent } from './ins-patient/gov-ins-patient-list.component';
import { GovInsUpdateBalanceComponent } from './ins-patient/gov-ins-update-balance.component';
import { GovINSPatientRegistrationComponent } from './ins-patient/ins-patient-registration/gov-ins-patient-registration.component';
import { GovInsuranceVisitBillingInfoComponent } from './ins-visit/ins-new-visit/ins-new-visit-billing-info.component';
import { GovInsuranceVisitInfoComponent } from './ins-visit/ins-new-visit/ins-new-visit-info.component';
import { GovInsuranceVisitMainComponent } from './ins-visit/ins-new-visit/ins-new-visit-main.component';
import { GovInsuranceVisitPatientInfoComponent } from './ins-visit/ins-new-visit/ins-new-visit-patient-info.component';
import { GovINSVisitListComponent } from './ins-visit/ins-visit-list.component';
import { GovInsuranceService } from './shared/ins-service';
import { GovInsuranceBlService } from './shared/insurance.bl.service';
import { GovInsuranceDlService } from './shared/insurance.dl.service';
//import { InsuranceBillingReceiptComponent } from './shared/ins-receipt/insurance-billing-receipt.component';
import { ADT_BLService } from '../../adt/shared/adt.bl.service';
import { ADT_DLService } from '../../adt/shared/adt.dl.service';
import { AppointmentDLService } from '../../appointments/shared/appointment.dl.service';
import { VisitBLService } from '../../appointments/shared/visit.bl.service';
import { VisitDLService } from '../../appointments/shared/visit.dl.service';
import { OrdersBLService } from '../../orders/shared/orders.bl.service';
import { PatientsBLService } from '../../patients/shared/patients.bl.service';
import { PatientsDLService } from '../../patients/shared/patients.dl.service';
import { GovInsBillingRequestComponent } from './ins-billing-request/gov-ins-billing-request.component';
import { GovInsuranceIpBillItemRequest } from './ins-ipd-billing/ins-ip-bill-request/gov-insurance-ip-bill-item-request';
import { GovInsurancePatientIpSummaryComponent } from './ins-ipd-billing/ins-ip-patient/gov-insurance-ip-patient-summary.component';
//import { InsuranceBillingDepositComponent } from './ins-ipd-billing/ins-bill-deposit/ins-billing-deposit.component';
import { BillingPrintSharedModule } from '../../billing/print-pages/billing-print-shared.module';
import { GovInsuranceEditBillItemComponent } from './ins-ipd-billing/ins-edit-item/gov-ins-edit-bill-item.component';
import { GovInsuranceUpdateItemPriceComponent } from './ins-ipd-billing/ins-update-item-price/gov-ins-update-item-price.component';
import { GovInsuranceIPBillingRequestSlipComponent } from './ins-ipd-billing/receipt/gov-ins-ip-billing-request-slip.component';
import { GovInsUpdateBalanceHistoryComponent } from './ins-patient/ins-price-history/gov-ins-price-history.component';
import { GovInsFollowUpVisitComponent } from './ins-visit/follow-up/ins-followup-visit.component';
import { GovInsPatientDuplicateWarningBox } from './shared/duplicate-warning/ins-patient-duplicate-warning-box.component';
import { GovInsStickerComponent } from './shared/sticker/ins-sticker-print.component';

@NgModule({

  providers: [
    GovInsuranceBlService,
    GovInsuranceDlService,
    GovInsuranceService,

    ADT_BLService,
    ADT_DLService,
    PatientsBLService,
    PatientsDLService,
    VisitDLService,
    VisitBLService,
    AppointmentDLService,
    OrdersBLService,

    { provide: LocationStrategy, useClass: HashLocationStrategy },

  ],
  imports: [
    CommonModule,
    GovInsuranceRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    DanpheAutoCompleteModule,
    SharedModule,
    SettingsSharedModule,
    BillingSharedModule,
    BillingPrintSharedModule
  ],
  declarations: [InsuranceComponent, GovINSPatientListComponent,
    GovINSVisitListComponent, GovINSIPDBillingComponent,
    GovINSPatientRegistrationComponent,
    GovInsuranceVisitMainComponent,
    GovInsuranceVisitBillingInfoComponent,
    GovInsuranceVisitPatientInfoComponent,
    GovInsuranceVisitInfoComponent,
    //InsuranceBillingReceiptComponent,
    GovINSPatientRegistrationComponent,
    GovInsUpdateBalanceComponent,
    GovInsPatientDuplicateWarningBox,
    GovInsBillingRequestComponent,
    GovInsuranceIpBillItemRequest,
    GovInsurancePatientIpSummaryComponent,
    GovInsuranceEditBillItemComponent,
    GovInsuranceUpdateItemPriceComponent,
    GovInsuranceIPBillingRequestSlipComponent,
    GovInsStickerComponent,
    GovInsFollowUpVisitComponent,
    GovInsUpdateBalanceHistoryComponent
  ],
  exports: [
    GovInsuranceVisitInfoComponent
  ]


})
export class GovInsuranceModule { }
