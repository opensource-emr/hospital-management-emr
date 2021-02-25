import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from '@angular/common';

import { SharedModule } from '../shared/shared.module';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete';
import { IncentiveRoutingModule } from './incentive-routing.module';
import { IncentiveDLService } from './shared/incentive.dl.service';
import { IncentiveBLService } from './shared/incentive.bl.service';

import { IncentiveMainComponent } from './incentive-main.component';
import { SettingMainComponent } from './setting/setting-main.component';
import { ProfileManageComponent } from './setting/profile-manage.component';
import { ProfileItemMapComponent } from './setting/profile-item-mapping.component';
import { IncentiveTxnItemsListComponent } from './items/inctv-txn-items-list.component';
import { EditIncentiveTxnItemComponent } from './items/edit-incentive-txn-item.component';
import { ViewIncentiveSettingsComponent } from './setting/view-emp-incentive-settings.component';
import { IncentiveTxnMainComponent } from './items/inctv-txn-Main.component';
import { IncentiveTxnInvoiceListComponent } from './items/inctv-txn-invoice-list.component ';
import { INCTV_LoadFractionFromBilling } from './load-fractions/load-fraction-from-billing';
import { INCTV_BIL_IncentivePaymentInfoComponent } from './items/incentive-payment-Info.component';
import { AccountingSharedModule } from '../accounting/shared/accounting-shared.module';
import { RPT_BIL_IncentiveReportMainComponent } from './reports/incentive-report-main-component';
import { RPT_BIL_IncentiveTransactionReportMainComponent } from './reports/transactionsReport/incentive-transaction-report-main-component';
import { INCTV_BIL_IncentiveItemComponent } from './reports/transactionsReport/incentive-item-summary-report.component';
import { INCTV_BIL_IncentiveItemGroupComponent } from './reports/transactionsReport/incentive-item-group-summary.component';
import { RPT_BIL_IncentiveReportSummaryComponent } from './reports/transactionsReport/incentive-report-summary.component';
import { RPT_INCTV_PaymentReportSummaryComponent } from './reports/paymentReport/incentive-payment-report-summary.component';
import { INCTV_RPT_IncentivePatientVsServiceComponent } from './reports/PatientVsServiceReport/incentive-patientVsService-report.component';
import { INCTV_BillTxnItemListComponent } from './transactions/items/inctv-billtxnitems-list.component';
import { INCTV_EditFractionComponent } from './shared/edit-fraction/inctv-edit-fraction.component';
import { EmployeeItemsSetupMainComponent } from './setting/employee-item-setup/employee-items-setup-main.component';
import { EmployeeItemsSetupComponentOld } from './setting/employee-item-setup/employee-items-setup.component - Old';
import { EmployeeItemsSetupComponent } from './setting/employee-item-setup/employee-items-setup/employee-items-setup.component';
import { Ng2SearchPipeModule } from 'ng2-search-filter';


@NgModule({
  providers: [
    IncentiveBLService,
    IncentiveDLService,
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  imports: [
    IncentiveRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    SharedModule,
    DanpheAutoCompleteModule,
    AccountingSharedModule,
    Ng2SearchPipeModule
  ],
  declarations: [
    IncentiveMainComponent,
    SettingMainComponent,
    ProfileManageComponent,
    ProfileItemMapComponent,
    IncentiveTxnItemsListComponent,
    EditIncentiveTxnItemComponent,
    ViewIncentiveSettingsComponent,
    IncentiveTxnMainComponent,
    IncentiveTxnInvoiceListComponent,
    INCTV_LoadFractionFromBilling,
    INCTV_BIL_IncentivePaymentInfoComponent,
    RPT_BIL_IncentiveReportMainComponent,
    RPT_BIL_IncentiveTransactionReportMainComponent,
    INCTV_BIL_IncentiveItemComponent,
    INCTV_BIL_IncentiveItemGroupComponent,
    RPT_BIL_IncentiveReportSummaryComponent,
    RPT_INCTV_PaymentReportSummaryComponent,
    INCTV_RPT_IncentivePatientVsServiceComponent,
    INCTV_BillTxnItemListComponent, //sud:10Apr'20-- for redesign of earlier incentive item component.
    INCTV_EditFractionComponent,
    EmployeeItemsSetupMainComponent,
    EmployeeItemsSetupComponentOld,
    EmployeeItemsSetupComponent,

  ],
  exports:[
    INCTV_EditFractionComponent
  ]

})
export class IncentiveModule { }
