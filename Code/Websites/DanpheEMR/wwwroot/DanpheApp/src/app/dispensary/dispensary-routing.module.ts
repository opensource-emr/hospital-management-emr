import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { PageNotFound } from '../404-error/404-not-found.component';
import { SalesMainComponent } from './dispensary-main/sales-main/sales-main.component';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { ActivateDispensaryComponent } from './activate-dispensary/activate-dispensary.component';
import { ActivateCounterComponent } from './dispensary-main/activate-counter/activate-counter.component';
import { DispensaryMainComponent } from './dispensary-main/dispensary-main.component';
import { PatientListComponent } from './dispensary-main/patient-main/patient-list/patient-list.component';
import { PatientMainComponent } from './dispensary-main/patient-main/patient-main.component';
import { PrescriptionListComponent } from './dispensary-main/prescription-main/prescription-list/prescription-list.component';
import { PrescriptionMainComponent } from './dispensary-main/prescription-main/prescription-main.component';
import { ReportsMainComponent } from './dispensary-main/reports-main/reports-main.component';
import { DispensaryGuardService } from './shared/dispensary-guard.service';
import { SalesListComponent } from './dispensary-main/sales-main/sales-list/sales-list.component';
import { NewSalesComponent } from './dispensary-main/sales-main/new-sales/new-sales.component';
import { SalesReturnComponent } from './dispensary-main/sales-main/sales-return/sales-return.component';
import { SalesReturnListComponent } from './dispensary-main/sales-main/sales-return-list/sales-return-list.component';
import { PrintReceiptComponent } from './dispensary-main/sales-main/print-receipt/print-receipt.component';
import { CreditBillsComponent } from './dispensary-main/sales-main/credit-bills/credit-bills.component';
import { SettlementComponent } from './dispensary-main/sales-main/settlement/settlement.component';
import { ProvisionalReturnComponent } from './dispensary-main/sales-main/provisional-return/provisional-return.component';
import { StockMainComponent } from './dispensary-main/stock-main/stock-main.component';
import { StockListComponent } from './dispensary-main/stock-main/stock-list/stock-list.component';
import { RequisitionListComponent } from './dispensary-main/stock-main/requisition/requisition-list/requisition-list.component';
import { RequisitionAddComponent } from './dispensary-main/stock-main/requisition/requisition-add/requisition-add.component';
import { RequisitionViewComponent } from './dispensary-main/stock-main/requisition/requisition-view/requisition-view.component';
import { ReceiveDispatchedStockComponent } from './dispensary-main/stock-main/requisition/receive-dispatched-stock/receive-dispatched-stock.component';
import { TransferListComponent } from './dispensary-main/stock-main/transfer-main/transfer-list/transfer-list.component';
import { TransferViewComponent } from './dispensary-main/stock-main/transfer-main/transfer-view/transfer-view.component';
import { TransferCreateComponent } from './dispensary-main/stock-main/transfer-main/transfer-create/transfer-create.component';
import { PHRMCounterwiseCollectionReportComponent } from '../pharmacy/report/counter-collection/phrm-counterwise-collection-report.component';
import { DISPNarcoticsDailySalesReportComponent } from './dispensary-main/reports-main/narcotis-dailysales/disp-narcotis-daily-sales-report.component';
import { DispUserwiseCollectionReportComponent } from './dispensary-main/reports-main/disp-user-wise-collection-report/disp-userwise-collection-report.component';
import { DispCashCollectionSummaryReportComponent } from './dispensary-main/reports-main/disp-cash-collection-summary-report/disp-cash-collection-summary-report.component';
import { DispDailySalesReportComponent } from './dispensary-main/reports-main/disp-daily-sales-report/disp-daily-sales-report.component';
import { PendingPHRMSettlementListComponent } from './dispensary-main/sales-main/settlement/pending-settlement-list/pending-settlement-list.component';
import { PHRMDuplicatePrintSettlementListComponent } from './dispensary-main/sales-main/settlement/duplicate-print-settlement-list/duplicate-print-settlement-list.component';
import { SettlementSummaryReportComponent } from './dispensary-main/reports-main/settlement-summary-report/settlement-summary-report.component';

const routes: Routes = [
  { path: 'ActivateDispensary', component: ActivateDispensaryComponent },
  {
    path: '', component: DispensaryMainComponent, canActivate: [AuthGuardService, DispensaryGuardService],
    children: [
      { path: '', redirectTo: 'Sale', pathMatch: 'full' },
      {
        path: 'Patient',
        component: PatientMainComponent,
        children: [
          { path: '', redirectTo: 'List', pathMatch: 'full' },
          { path: 'List', component: PatientListComponent },
          { path: "**", component: PageNotFound }

        ]
      },
      {
        path: 'Prescription',
        component: PrescriptionMainComponent,
        children: [
          { path: '', redirectTo: 'List', pathMatch: 'full' },
          { path: 'List', component: PrescriptionListComponent },
          { path: "**", component: PageNotFound }
        ]
      },
      {
        path: 'Sale',
        component: SalesMainComponent,
        children: [
          { path: '', redirectTo: 'New', pathMatch: 'full' },
          { path: 'List', component: SalesListComponent },
          { path: 'New', component: NewSalesComponent },
          { path: 'Return', component: SalesReturnComponent },
          { path: 'ReturnList', component: SalesReturnListComponent },
          { path: 'ReceiptPrint', component: PrintReceiptComponent },
          { path: 'CreditBills', component: CreditBillsComponent },
          {
            path: 'Settlement', component: SettlementComponent,
            children: [
              { path: '', redirectTo: 'PendingSettlements', pathMatch: 'full' },
              { path: 'PendingSettlements', component: PendingPHRMSettlementListComponent },
              { path: 'SettlementReceipts', component: PHRMDuplicatePrintSettlementListComponent },

            ]

          },
          { path: 'ProvisionalReturn', component: ProvisionalReturnComponent, canActivate: [AuthGuardService] },
          // { path: 'Dispatch', component: PHRMDispatchComponent }, //will not be in use for now
          // { path: 'SaleCredit', component: PHRMSaleCreditComponent },//will not be in use for now
          { path: "**", component: PageNotFound }
        ]
      },
      {
        path: 'Stock',
        component: StockMainComponent,
        children: [
          { path: '', redirectTo: 'StockDetails', pathMatch: 'full' },
          { path: 'StockDetails', component: StockListComponent },
          {
            path: 'Requisition', children: [
              { path: '', redirectTo: 'List', pathMatch: 'full' },
              { path: 'List', component: RequisitionListComponent },
              { path: 'Add', component: RequisitionAddComponent },
              { path: 'View', component: RequisitionViewComponent },
              { path: 'ReceiveStock', component: ReceiveDispatchedStockComponent },
            ]
          },
          {
            path: 'Transfer', children: [
              { path: '', redirectTo: 'List', pathMatch: 'full' },
              { path: 'List', component: TransferListComponent },
              { path: 'Add', component: TransferCreateComponent },
              { path: 'View', component: TransferViewComponent },
            ]
          },
          { path: "**", component: PageNotFound }


        ]
      },
      { path: 'ActivateCounter', component: ActivateCounterComponent },
      { path: 'Reports', component: ReportsMainComponent },
      { path: 'Reports/UserWiseCollectionReport', component: DispUserwiseCollectionReportComponent },
      { path: 'Reports/DISPNarcoticsDailySalesReport', component: DISPNarcoticsDailySalesReportComponent },
      { path: 'Reports/DISPCashCollectionSummaryReport', component: DispCashCollectionSummaryReportComponent },
      { path: 'Reports/DISPDailySalesReport', component: DispDailySalesReportComponent },
      { path: 'Reports/SettlementSummaryReport', component: SettlementSummaryReportComponent },
      { path: "**", component: PageNotFound }
    ]
  },

];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class DispensaryRoutingModule { }
