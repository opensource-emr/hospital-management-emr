import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

import { BillingTransactionComponent } from './bill-transaction/billing-transaction.component';
import { BillingMainComponent } from './billing-main.component';
import { BillingTransactionItemComponent } from './bill-transaction/billing-transaction-item.component';
import { BillingSearchPatientComponent } from './search-patient/billing-search-patient.component';
import { ProvisionalBillingComponent } from './bill-provisional/provisional-billing.component';
//import { InsuranceProvisionalBillingComponent } from './bill-provisional/insurance-provisional-billing.component';
import { ReceiptPrintMainComponent } from './receipt/receipt-print-main.component';
import { BillOrderRequestComponent } from './bill-request/bill-order-request.component';
import { BillingDepositComponent } from './bill-deposit/billing-deposit.component';
import { BillCancellationRequestComponent } from './bill-cancellation/bill-cancellation-request.component';
import { BillingCounterActivateComponent } from './bill-counter/billing-counter-activate.component';
import { BillReturnRequestComponent } from './bill-return/bill-return-request.component';
import { EditDoctorFeatureComponent } from './edit-doctors/edit-doctor-feature.component';

import { ResetPatientcontextGuard } from '../shared/reset-patientcontext-guard';
import { BillingSelectPatientCanActivateGuard } from './shared/billing-select-patient-canactivate-guard';
import { BillingDashboardComponent } from '../dashboards/billing/billing-dashboard.component';

import { BillDuplicatePrintsMainComponent } from "./bill-duplicate-prints/bill-duplicate-prints-main.component";
import { DuplicateInvoicePrintComponent } from './bill-duplicate-prints/duplicate-invoice-print.component';
import { DuplicateDepositReceiptComponent } from "./bill-duplicate-prints/duplicate-deposit-receipt-print.component";
import { DuplicateCreditSettlementReceiptComponent } from "./bill-duplicate-prints/duplicate-credit-settlement-receipt-print.component";
import { DuplicateDepositSettlementReceiptPrintComponent } from "./bill-duplicate-prints/duplicate-deposit-settlement-receipt-print.component";
import { IpBillMainComponent } from './ip-billing/ip-billing.main.component';
//import { ResetBillingContextGuard } from '../shared/reset-billingcontext-guard';

import { BillSettlementsComponent } from './bill-settlements/bill-settlements.component';
import { SettlementsMainComponent } from '../billing/bill-settlements/settlements.main.component';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { BillingDenominationComponent } from './bill-denomination/bill-denomination.component';
import { DuplicateProvisionalReceiptComponent } from './bill-duplicate-prints/duplicate-provisional-receipt.component';
import { QrBillingComponent } from '../shared/qr-code/billing/qr-billing.component';
import { PageNotFound } from '../404-error/404-not-found.component';

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
          { path: 'SearchPatient', component: BillingSearchPatientComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'BillingTransaction', component: BillingTransactionComponent, canActivate: [AuthGuardService, BillingSelectPatientCanActivateGuard] },
          { path: 'BillingTransactionItem', component: BillingTransactionItemComponent, canActivate: [AuthGuardService] },
          { path: 'UnpaidBills', component: ProvisionalBillingComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          //{ path: 'InsuranceProvisional', component: InsuranceProvisionalBillingComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'ReceiptPrint', component: ReceiptPrintMainComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'BillOrderRequest', component: BillOrderRequestComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'BillingDeposit', component: BillingDepositComponent, canActivate: [AuthGuardService, BillingSelectPatientCanActivateGuard] },
          { path: 'BillCancellationRequest', component: BillCancellationRequestComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'BillReturnRequest', component: BillReturnRequestComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
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
          {
            path: 'DuplicatePrints', component: BillDuplicatePrintsMainComponent,
            children: [
              { path: '', redirectTo: 'Invoice', pathMatch: 'full' },
              { path: 'Invoice', component: DuplicateInvoicePrintComponent, canActivate: [AuthGuardService] },
              { path: 'DepositReceipt', component: DuplicateDepositReceiptComponent, canActivate: [AuthGuardService] },
              { path: 'CreditSettlementReceipt', component: DuplicateCreditSettlementReceiptComponent, canActivate: [AuthGuardService] },
              { path: 'DepositSettlementReceipt', component: DuplicateDepositSettlementReceiptPrintComponent, canActivate: [AuthGuardService] },
              { path: 'ProvisionalReceipt', component: DuplicateProvisionalReceiptComponent, canActivate: [AuthGuardService] },
              { path: "**", component: PageNotFound }

              
            ]
            , canActivate: [AuthGuardService, ResetPatientcontextGuard]
          },

          //{ path: 'InpatBilling', loadChildren: '/compiled-js/app/billing/ip-billing/ip-billing.module#IpBillingModule' },
          { path: 'InpatBilling', component: IpBillMainComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },
          { path: 'BillingDenomination', component: BillingDenominationComponent, canActivate: [AuthGuardService, ResetPatientcontextGuard] },

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
