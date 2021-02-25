import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { AuthGuardService } from '../security/shared/auth-guard.service';

import { IncentiveMainComponent } from './incentive-main.component';
import { SettingMainComponent } from './setting/setting-main.component';
import { ProfileManageComponent } from './setting/profile-manage.component';
import { IncentiveTxnMainComponent } from './items/inctv-txn-Main.component';
import { IncentiveTxnInvoiceListComponent } from './items/inctv-txn-invoice-list.component ';
import { IncentiveTxnItemsListComponent } from './items/inctv-txn-items-list.component';
import { INCTV_LoadFractionFromBilling } from './load-fractions/load-fraction-from-billing';
import { INCTV_BIL_IncentivePaymentInfoComponent } from './items/incentive-payment-Info.component';
import { RPT_BIL_IncentiveReportMainComponent } from './reports/incentive-report-main-component';
import { RPT_BIL_IncentiveTransactionReportMainComponent } from './reports/transactionsReport/incentive-transaction-report-main-component';
import { RPT_INCTV_PaymentReportSummaryComponent } from './reports/paymentReport/incentive-payment-report-summary.component';
import { INCTV_RPT_IncentivePatientVsServiceComponent } from './reports/PatientVsServiceReport/incentive-patientVsService-report.component';
import { INCTV_BillTxnItemListComponent } from './transactions/items/inctv-billtxnitems-list.component';
import { PageNotFound } from '../404-error/404-not-found.component';
import { EmployeeItemsSetupMainComponent } from './setting/employee-item-setup/employee-items-setup-main.component';
import { EmployeeItemsSetupComponentOld } from './setting/employee-item-setup/employee-items-setup.component - Old';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: IncentiveMainComponent,
        children: [
          { path: '', redirectTo: 'Transactions', pathMatch: 'full' },

          {
            path: 'Setting',
            component: SettingMainComponent,
            children: [
              { path: '', redirectTo: 'EmployeeItemsSetup', pathMatch: 'full' },
              { path: 'ProfileManage', component: ProfileManageComponent },
              //{ path: 'EmployeeProfileMap', component: EmployeeProfileMapComponent },
              { path: 'EmployeeItemsSetup', component: EmployeeItemsSetupMainComponent },
              { path: 'EmployeeItemsSetupOld', component: EmployeeItemsSetupComponentOld },
              { path: "**", component: PageNotFound }
            ]
          },
          //{ path: 'Reports', component: RPT_BIL_IncentiveReportMainComponent },
          //{ path: 'Transactions', component: IncentiveTxnItemsListComponent }
          //{ path: 'Transactions', component: IncentiveTxnInvoiceListComponent }
          {
            path: 'Reports',
            component: RPT_BIL_IncentiveReportMainComponent,
            children: [
              { path: '', redirectTo: 'TransactionReport', pathMatch: 'full' },
              { path: 'TransactionReport', component: RPT_BIL_IncentiveTransactionReportMainComponent },
              { path: 'PaymentReport', component: RPT_INCTV_PaymentReportSummaryComponent },
              { path: 'PatientVsService', component: INCTV_RPT_IncentivePatientVsServiceComponent },
              { path: "**", component: PageNotFound }


            ]
          },
          {
            path: 'Transactions', component: IncentiveTxnMainComponent,
            children: [
              { path: '', redirectTo: 'InvoiceLevel', pathMatch: 'full' },
              //{ path: 'InvoiceItemLevel', component: IncentiveTxnItemsListComponent },//sud: 10Apr'20-- commented this and added below.
              { path: 'InvoiceItemLevel', component: INCTV_BillTxnItemListComponent },
              { path: 'InvoiceLevel', component: IncentiveTxnInvoiceListComponent },
              { path: 'BillSync', component: INCTV_LoadFractionFromBilling },
              { path: 'MakePayment', component: INCTV_BIL_IncentivePaymentInfoComponent },
              { path: "**", component: PageNotFound }

            ]
          }
        ]
      },
      { path: "**", component: PageNotFound }
    ])
  ],
  exports: [
    RouterModule
  ]
})

export class IncentiveRoutingModule {

}
