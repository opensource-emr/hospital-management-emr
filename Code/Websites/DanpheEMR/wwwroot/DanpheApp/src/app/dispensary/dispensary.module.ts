import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { DispensaryRoutingModule } from './dispensary-routing.module';
import { DispensaryMainComponent } from './dispensary-main/dispensary-main.component';
import { ActivateDispensaryComponent } from './activate-dispensary/activate-dispensary.component';
import { DispensaryGuardService } from './shared/dispensary-guard.service';
import { SharedModule } from '../shared/shared.module';
import { ReportsMainComponent } from './dispensary-main/reports-main/reports-main.component';
import { ActivateCounterComponent } from './dispensary-main/activate-counter/activate-counter.component';
import { PharmacyBLService } from '../pharmacy/shared/pharmacy.bl.service';
import { PharmacyDLService } from '../pharmacy/shared/pharmacy.dl.service';
import { PatientMainComponent } from './dispensary-main/patient-main/patient-main.component';
import { PatientListComponent } from './dispensary-main/patient-main/patient-list/patient-list.component';
import { PatientDepositAddComponent } from './dispensary-main/patient-main/patient-deposit-add/patient-deposit-add.component';
import { PharmacyService } from '../pharmacy/shared/pharmacy.service';
import { PrescriptionMainComponent } from './dispensary-main/prescription-main/prescription-main.component';
import { PrescriptionListComponent } from './dispensary-main/prescription-main/prescription-list/prescription-list.component';
import { SalesMainComponent } from './dispensary-main/sales-main/sales-main.component';
import { SalesListComponent } from './dispensary-main/sales-main/sales-list/sales-list.component';
import { NewSalesComponent } from './dispensary-main/sales-main/new-sales/new-sales.component';
import { PhrmOutpatientAddComponent } from '../pharmacy/sale/op-patient-add/phrm-op-patient-add.component';
import { SettingsSharedModule } from '../settings-new/settings-shared.module';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { PatientSharedModule } from '../patients/patient-shared.module';
import { PatientsBLService } from '../patients/shared/patients.bl.service';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { ADT_DLService } from '../adt/shared/adt.dl.service';
import { SalesReturnComponent } from './dispensary-main/sales-main/sales-return/sales-return.component';
import { SalesReturnListComponent } from './dispensary-main/sales-main/sales-return-list/sales-return-list.component';
import { BillingBLService } from '../billing/shared/billing.bl.service';
import { PrintReceiptComponent } from './dispensary-main/sales-main/print-receipt/print-receipt.component';
import { CreditBillsComponent } from './dispensary-main/sales-main/credit-bills/credit-bills.component';
import { SettlementComponent } from './dispensary-main/sales-main/settlement/settlement.component';
import { SettlementReceiptComponent } from './dispensary-main/sales-main/settlement/settlement-receipt/settlement-receipt.component';
import { ProvisionalReturnComponent } from './dispensary-main/sales-main/provisional-return/provisional-return.component';
import { StockMainComponent } from './dispensary-main/stock-main/stock-main.component';
import { StockListComponent } from './dispensary-main/stock-main/stock-list/stock-list.component';
import { RequisitionListComponent } from './dispensary-main/stock-main/requisition/requisition-list/requisition-list.component';
import { RequisitionAddComponent } from './dispensary-main/stock-main/requisition/requisition-add/requisition-add.component';
import { RequisitionViewComponent } from './dispensary-main/stock-main/requisition/requisition-view/requisition-view.component';
import { DispensaryRequisitionEndpoint } from './dispensary-main/stock-main/requisition/dispensary-requisition-endpoint';
import { DispensaryRequisitionService } from './dispensary-main/stock-main/requisition/dispensary-requisition.service';
import { ReceiveDispatchedStockComponent } from './dispensary-main/stock-main/requisition/receive-dispatched-stock/receive-dispatched-stock.component';
import { TransferMainComponent } from './dispensary-main/stock-main/transfer-main/transfer-main.component';
import { TransferCreateComponent } from './dispensary-main/stock-main/transfer-main/transfer-create/transfer-create.component';
import { TransferViewComponent } from './dispensary-main/stock-main/transfer-main/transfer-view/transfer-view.component';
import { TransferListComponent } from './dispensary-main/stock-main/transfer-main/transfer-list/transfer-list.component';
import { TransferService } from './dispensary-main/stock-main/transfer-main/transfer.service';
import { TransferEndpointService } from './dispensary-main/stock-main/transfer-main/transfer-endpoint.service';
import { PHRMStockListComponent } from './dispensary-main/sales-main/new-sales/stock-list-pop-up/stock-list-pop-up.component';
import { DISPNarcoticsDailySalesReportComponent } from './dispensary-main/reports-main/narcotis-dailysales/disp-narcotis-daily-sales-report.component';
import { DispCashCollectionSummaryReportComponent } from './dispensary-main/reports-main/disp-cash-collection-summary-report/disp-cash-collection-summary-report.component';
import { DispUserwiseCollectionReportComponent } from './dispensary-main/reports-main/disp-user-wise-collection-report/disp-userwise-collection-report.component';
import { ManualSalesReturnComponent } from './dispensary-main/sales-main/sales-return/manual-sales-return/manual-sales-return.component';
import { DispDailySalesReportComponent } from './dispensary-main/reports-main/disp-daily-sales-report/disp-daily-sales-report.component';
import { PHRMSettlementInvoiceDetail } from './dispensary-main/sales-main/settlement/phrm-settlement-invoice-detail.component';
import { PHRMDuplicatePrintSettlementListComponent } from './dispensary-main/sales-main/settlement/duplicate-print-settlement-list/duplicate-print-settlement-list.component';
import { PendingPHRMSettlementListComponent } from './dispensary-main/sales-main/settlement/pending-settlement-list/pending-settlement-list.component';
import { SettlementSummaryReportComponent } from './dispensary-main/reports-main/settlement-summary-report/settlement-summary-report.component';

@NgModule({
  declarations: [DispensaryMainComponent, ActivateDispensaryComponent, ReportsMainComponent, ActivateCounterComponent, PatientMainComponent, PatientListComponent, PatientDepositAddComponent, PrescriptionMainComponent, PrescriptionListComponent, SalesMainComponent, SalesListComponent, NewSalesComponent, PhrmOutpatientAddComponent, SalesReturnComponent, SalesReturnListComponent, PrintReceiptComponent, CreditBillsComponent, SettlementComponent, SettlementReceiptComponent, ProvisionalReturnComponent, StockMainComponent, StockListComponent, RequisitionListComponent, RequisitionAddComponent, RequisitionViewComponent, ReceiveDispatchedStockComponent, TransferMainComponent, TransferCreateComponent, TransferViewComponent, TransferListComponent, PHRMStockListComponent, DISPNarcoticsDailySalesReportComponent, DispUserwiseCollectionReportComponent, DispCashCollectionSummaryReportComponent, ManualSalesReturnComponent, DispDailySalesReportComponent, PHRMSettlementInvoiceDetail, PHRMDuplicatePrintSettlementListComponent, PendingPHRMSettlementListComponent,SettlementSummaryReportComponent],
  providers: [DispensaryGuardService, PharmacyBLService, PharmacyDLService, PharmacyService, PatientsBLService, AppointmentDLService, VisitDLService, ADT_DLService, BillingBLService, DispensaryRequisitionService, DispensaryRequisitionEndpoint, TransferService, TransferEndpointService],
  imports: [CommonModule, FormsModule, ReactiveFormsModule, DispensaryRoutingModule, SharedModule, SettingsSharedModule, DanpheAutoCompleteModule, PatientSharedModule]
})
export class DispensaryModule { }
