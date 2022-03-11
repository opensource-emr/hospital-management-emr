import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BillingTransactionComponent } from './bill-transaction/billing-transaction.component';
import { BillingMainComponent } from './billing-main.component';
import { BillingTransactionItemComponent } from './bill-transaction/billing-transaction-item.component';
import { BillingSearchPatientComponent } from './search-patient/billing-search-patient.component';//don't remove this.. (sud:22May'21)
import { BillingSearchPatientNewComponent } from './search-patient/billing-search-patient-new.component';
import { ProvisionalBillingComponent } from './bill-provisional/provisional-billing.component';
//import { InsuranceProvisionalBillingComponent } from './bill-provisional/insurance-provisional-billing.component';
import { BillOrderRequestComponent } from './bill-request/bill-order-request.component';
import { BillingDepositComponent } from './bill-deposit/billing-deposit.component';
import { BillCancellationRequestComponent } from './bill-cancellation/bill-cancellation-request.component';
import { BillingCounterActivateComponent } from './bill-counter/billing-counter-activate.component';
import { EditDoctorFeatureComponent } from './edit-doctors/edit-doctor-feature.component';
import { ResetPatientcontextGuard } from '../shared/reset-patientcontext-guard';
import { BillingSelectPatientCanActivateGuard } from './shared/billing-select-patient-canactivate-guard';
import { BillingDashboardComponent } from '../dashboards/billing/billing-dashboard.component';
import { IpBillMainComponent } from './ip-billing/ip-billing.main.component';
import { BillSettlementsComponent } from './bill-settlements/bill-settlements.component';
import { SettlementsMainComponent } from '../billing/bill-settlements/settlements.main.component';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { QrBillingComponent } from '../shared/qr-code/billing/qr-billing.component';
import { PageNotFound } from '../404-error/404-not-found.component';
import { BillingDenominationMainComponent } from './bill-denomination/bill-denomination-main.component';
import { BillingDenominationReportComponent } from './bill-denomination/Reports/bill-denomination-reports.component';
import { BillingDenominationCounterComponent } from './bill-denomination/Counter/bill-denomination-counter.component';
import { BillingDenominationAccountsComponent } from './bill-denomination/Accounts/bill-denomination-accounts.component';
import { BILL_CreditNoteComponent } from './bill-return/bill-credit-note.component';
import { BillingDenominationSummaryReportComponent } from './bill-denomination/Reports/bill-denomination-summary-reports';
import { BillingDailyCollectionVsHandoverReportComponent } from './bill-denomination/Reports/bill-dailycollectionVsHandover-reports';

//import { INSBillingMainComponent } from './ins-billing/ins-billing-main.component';


@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: BillingMainComponent, canDeactivate: [ResetPatientcontextGuard],
        children: [
          //we're reseting patient context using canActivate: [ResetPatientcontextGuard] only in some routes, this was being done inside...
          //component->constructor earlier,moved it to central place--Sudarshan-10April'17

          { path: '', redirectTo: 'SearchPatient', pathMatch: 'full' },
          { path: 'Dashboard', component: BillingDashboardComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          //below first component is used by EMR-hospitals (other than LPH).. don't remove these.. since we may need to switch back to the old one later.
          //{ path: 'SearchPatient', component: BillingSearchPatientComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'SearchPatient', component: BillingSearchPatientNewComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'BillingTransaction', component: BillingTransactionComponent, canActivate: [AuthGuardService, BillingSelectPatientCanActivateGuard] },
          { path: 'BillingTransactionItem', component: BillingTransactionItemComponent, canActivate: [AuthGuardService] },
          { path: 'UnpaidBills', component: ProvisionalBillingComponent, canActivate: [AuthGuardService] },//ResetPatientcontextGuard
          //don't remove below until finalized from hospitals using old version.
          //{ path: 'InsuranceProvisional', component: InsuranceProvisionalBillingComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'BillOrderRequest', component: BillOrderRequestComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'BillingDeposit', component: BillingDepositComponent, canActivate: [AuthGuardService, BillingSelectPatientCanActivateGuard] },
          { path: 'BillCancellationRequest', component: BillCancellationRequestComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'BillReturnRequest', component: BILL_CreditNoteComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'CounterActivate', component: BillingCounterActivateComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'EditDoctor', component: EditDoctorFeatureComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          {
            path: 'Settlements', component: SettlementsMainComponent,
            children: [
              { path: '', redirectTo: 'BillSettlements', pathMatch: 'full' },
              { path: 'BillSettlements', component: BillSettlementsComponent },
              { path: "**", component: PageNotFound }

            ]
            , canActivate: [ResetPatientcontextGuard]
          },
          { path: 'DuplicatePrints', loadChildren: '../billing/bill-duplicate-prints/bil-duplicate-prints.module#Bil_DuplicatePrintsModule', canActivate: [AuthGuardService, ResetPatientcontextGuard] },

          //{ path: 'InpatBilling', loadChildren: '/compiled-js/app/billing/ip-billing/ip-billing.module#IpBillingModule' },
          { path: 'InpatBilling', component: IpBillMainComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          {
            path: 'BillingDenomination', component: BillingDenominationMainComponent,
            children: [
              { path: '', redirectTo: 'Counter', pathMatch: 'full' },
              { path: 'Counter', component: BillingDenominationCounterComponent, canActivate: [AuthGuardService] },
              { path: 'Accounts', component: BillingDenominationAccountsComponent, canActivate: [AuthGuardService] },
              { path: 'HandoverReceiveTransactionReport', component: BillingDenominationReportComponent, canActivate: [AuthGuardService] },
              { path: 'HandoverSummaryReport', component: BillingDenominationSummaryReportComponent, canActivate: [AuthGuardService] },
              { path: 'DailyCollectionVsHandoverReport', component: BillingDailyCollectionVsHandoverReportComponent, canActivate: [AuthGuardService] },
              { path: "**", component: PageNotFound }
            ]
            , canActivate: [AuthGuardService, ResetPatientcontextGuard]
          },

          { path: 'InsuranceMain', loadChildren: '../billing/ins-billing/ins-billing.module#InsuranceBillingModule' },
          { path: 'QrBilling', component: QrBillingComponent, canActivate: [AuthGuardService] },
          { path: "**", component: PageNotFound },
        ]
      },
      { path: "**", component: PageNotFound }

    ])
  ],
  exports: [
    RouterModule
  ]
})
export class BillingRoutingModule { }
