import { NgModule } from '@angular/core';
import { CommonModule, HashLocationStrategy, LocationStrategy } from '@angular/common';

import { InsuranceRoutingModule } from './insurance-routing.module';
import { InsuranceComponent } from './insurance.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete';
import { SharedModule } from '../shared/shared.module';
import { InsuranceBlService } from './shared/insurance.bl.service';
import { InsuranceDlService } from './shared/insurance.dl.service';
import { INSPatientListComponent } from './ins-patient/ins-patient-list.component';
import { INSVisitListComponent } from './ins-visit/ins-visit-list.component';
import { INSIPDBillingComponent } from './ins-ipd-billing/ins-ipd-billing-patient-list.component';
import { INSPatientRegistrationComponent } from './ins-patient/ins-patient-registration/ins-patient-registration.component';
import { InsuranceService } from './shared/ins-service';
import { GovInsUpdateBalanceComponent } from './ins-patient/ins-update-balance.comoponent';
import { SettingsSharedModule } from '../settings-new/settings-shared.module';
import { BillingSharedModule } from '../billing/billing-shared.module';
import { InsuranceVisitMainComponent } from './ins-visit/ins-new-visit/ins-new-visit-main.component';
import { InsuranceVisitPatientInfoComponent } from './ins-visit/ins-new-visit/ins-new-visit-patient-info.component';
import { InsuranceVisitBillingInfoComponent } from './ins-visit/ins-new-visit/ins-new-visit-billing-info.component';
import { InsuranceVisitInfoComponent } from './ins-visit/ins-new-visit/ins-new-visit-info.component';
//import { InsuranceBillingReceiptComponent } from './shared/ins-receipt/insurance-billing-receipt.component';
import { InsBillingRequestComponent } from './ins-billing-request/ins-billing-request.component';
import { PatientsBLService } from '../patients/shared/patients.bl.service';
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { ADT_BLService } from '../adt/shared/adt.bl.service';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';
import { ADT_DLService } from '../adt/shared/adt.dl.service';
import { VisitBLService } from '../appointments/shared/visit.bl.service';
import { PatientsDLService } from '../patients/shared/patients.dl.service';
import { OrdersBLService } from '../orders/shared/orders.bl.service';
import { InsuranceIpBillItemRequest } from './ins-ipd-billing/ins-ip-bill-request/insurance-ip-bill-item-request';
import { InsurancePatientIpSummaryComponent } from './ins-ipd-billing/ins-ip-patient/insurance-ip-patient-summary.component';
//import { InsuranceBillingDepositComponent } from './ins-ipd-billing/ins-bill-deposit/ins-billing-deposit.component';
import { InsStickerComponent } from './shared/sticker/ins-sticker-print.component';
import { InsFollowUpVisitComponent } from './ins-visit/follow-up/ins-followup-visit.component';
import { InsuranceIPBillingRequestSlipComponent } from './ins-ipd-billing/receipt/ins-ip-billing-request-slip.component';
import { InsuranceEditBillItemComponent } from './ins-ipd-billing/ins-edit-item/ins-edit-bill-item.component';
import { InsuranceUpdateItemPriceComponent } from './ins-ipd-billing/ins-update-item-price/ins-update-item-price.component';
import { InsPatientDuplicateWarningBox } from './shared/duplicate-warning/ins-patient-duplicate-warning-box.component'
import { InsUpdateBalanceHistoryComponent } from './ins-patient/ins-price-history/ins-price-history.component';
import { BillingPrintSharedModule } from '../billing/print-pages/billing-print-shared.module';

@NgModule({

  providers: [
    InsuranceBlService,
    InsuranceDlService,
    InsuranceService,

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
    InsuranceRoutingModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    DanpheAutoCompleteModule,
    SharedModule,
    SettingsSharedModule,
    BillingSharedModule,
    BillingPrintSharedModule
  ],
  declarations: [InsuranceComponent, INSPatientListComponent,
    INSVisitListComponent, INSIPDBillingComponent,
    INSPatientRegistrationComponent,
    InsuranceVisitMainComponent,
    InsuranceVisitBillingInfoComponent,
    InsuranceVisitPatientInfoComponent,
    InsuranceVisitInfoComponent,
    //InsuranceBillingReceiptComponent,
    INSPatientRegistrationComponent,
    GovInsUpdateBalanceComponent,
    InsPatientDuplicateWarningBox,
    InsBillingRequestComponent,
    InsuranceIpBillItemRequest,
    InsurancePatientIpSummaryComponent,
    InsuranceEditBillItemComponent,
    InsuranceUpdateItemPriceComponent,
    InsuranceIPBillingRequestSlipComponent,
    InsStickerComponent,
    InsFollowUpVisitComponent,
    InsUpdateBalanceHistoryComponent
  ],
  exports: [
    InsuranceVisitInfoComponent
  ]


})
export class InsuranceModule { }
