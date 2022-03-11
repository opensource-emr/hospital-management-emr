
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";


//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { SharedModule } from "../shared/shared.module";
import { PharmacyRoutingModule } from "./pharmacy-routing.module";

import { PharmacyBLService } from "./shared/pharmacy.bl.service"
import { PharmacyDLService } from './shared/pharmacy.dl.service';
import { PharmacyService } from './shared/pharmacy.service';
import { ReportingService } from "../reporting/shared/reporting-service";
import { PhrmRackService } from './shared/rack/phrm-rack.service';
import { PhrmRackEndPoint } from './shared/rack/phrm-rack.endpoint';

import { PhrmRackComponent } from "./rack/phrm-rack.component";
import { PharmacyMainComponent } from "./pharmacy-main.component";
import { PHRMBillingMainComponent } from "./billing/phrm-billing-main.component"
import { PHRMOrderMainComponent } from "./order/phrm-order-main.component"
import { PHRMPrescriptionMainComponent } from "./prescription/phrm-prescription-main.component"
import { PHRMReportMainComponent } from "./report/phrm-report-main.component"
import { PHRMSettingMainComponent } from "./setting/phrm-setting-main.component"
import { PHRMSupplierManageComponent } from "./setting/supplier/phrm-supplier-manage.component"
import { PHRMPurchaseOrderComponent } from "./order/phrm-po/phrm-purchase-order.component"
import { PHRMPrescriptionComponent } from "./prescription/phrm-prescription.component"
import { PHRMGoodsReceiptListComponent } from "./order/phrm-gr-list/phrm-goods-receipt-list.component"
import { PHRMTAXManageComponent } from "./setting/tax/phrm-tax-manage.component"
import { PHRMPurchaseOrderListComponent } from "./order/phrm-po-list/phrm-purchase-order-list.component";
import { PHRMPurchaseOrderReportComponent } from "./report/po/phrm-purchase-order-report.component"
import { PHRMItemWiseStockReportComponent } from "./report/itemwise-stock/phrm-itemwise-stock-report.component"
import { PharmacyDashboardComponent } from '../dashboards/pharmacy/pharmacy-dashboard.component';
import { PHRMPrescriptionListComponent } from "./prescription/phrm-prescription-list.component";
import { PHRMReceiptPrintComponent } from "./sale/phrm-receipt-print.component"
import { PHRMSupplierInformationReportComponent } from './report/supplier-info/phrm-supplier-information-report.component';
import { PHRMCreditInOutPatientReportComponent } from './report/credit-inout-patient/phrm-credit-in-out-patient-report.component';
import { PHRMStockItemsReportComponent } from './report/stock-items/phrm-stock-items-report.component';
import { PHRMSupplierStockSummaryReportComponent } from './report/supplier-stock/phrm-supplier-stock-summary-report.component';
import { PHRMStockMovementReportComponent } from './report/stock-movement/phrm-stock-movement-report.component';
import { PHRMBatchStockReportComponent } from './report/batch-stock/phrm-batch-stock-report.component';
import { PHRMSupplierStockReportComponent } from './report/supplier-stock/phrm-supplier-stock-report.component';
import { PHRMEndingStockSummaryReportComponent } from './report/ending-stock/phrm-ending-stock-summary-report.component';
import { PHRMBillingReportComponent } from './report/billing/phrm-billing-report.component';
import { PHRMDailyStockSummaryReportComponent } from './report/daily-stock/phrm-daily-stock-summary-report.component';
import { PHRMExpiryReportComponent } from './report/expiry-stock/phrm-expiry-report.component';
import { PHRMMinStockComponent } from './report/min-stock/phrm-minstock-report.component';
import { PHRMDailySalesSummaryComponent } from './report/daily-sales/phrm-daily-sales-summary.component';
import { PHRMABCVEDReportComponent } from './report/abc-ved/phrm-abcved-report.component';
import { PharmacyCounterActivateComponent } from './counter/pharmacy-counter-activate.component'
import { PHRMCashCollectionSummaryReportComponent } from './report/cash-collection/phrm-cashcollection-summary-report.component ';
import { PHRMUserwiseCollectionReportComponent } from './report/user-collection/phrm-userwise-collection-report.component';
import { PHRMCounterwiseCollectionReportComponent } from './report/counter-collection/phrm-counterwise-collection-report.component';
import { PHRMSaleReturnReportComponent } from './report/sales-return/phrm-sale-return-report.component';
import { phrmitemaddComponent } from './common/phrmitem-add.component';
import { PHRMCompanyAddComponent } from './common/company/company-add';
import { PHRMBreakageItemReportComponent } from "./report/breakage-items/phrm-breakage-item-report.component";
import { PHRMGoodsReceiptProductReportComponent } from "./report/gr-products/phrm-good-receipt-product-report.component";
import { PHRMGenericAddComponent } from './common/Generic/generic-add.component';
import { PhrmRackAddComponent } from './rack/phrm-rack-add.component';
import { PhrmRackDrugListComponent } from './rack/phrm-rack-drug-list.component';
//import { PrintHeaderComponent } from '../shared/print-header/print-header';
import { PHRMCreditBillsComponent } from './sale/credit-billing/phrm-credit-bills.component';
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { PatientsDLService } from '../patients/shared/patients.dl.service';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';
import { BillingDLService } from '../billing/shared/billing.dl.service';
import { ADT_DLService } from '../adt/shared/adt.dl.service';
import { PHRMStockManageReportComponent } from "./report/stock-manage/phrm-stock-manage-report.component";
import { PHRMStoreDetailsListComponent } from "./store/store-details/phrm-store-details-list.component";
import { PHRMReturnItemsToSupplierComponent } from "./store/return-to-supplier/phrm-return-items-to-supplier.component";
import { PHRMReturnItemToSupplierListComponent } from "./store/return-to-supplier/phrm-return-item-to-supplier-list.component";
import { PHRMDrugCategoryWiseReportComponent } from "./report/drug-category/phrm-drug-categorywise-report.component";

//sud:30Sept'18--to replace ng-autocomplete with danphe-autocomplete
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { PHRMProvisionalItems } from "./provisional-items/phrm-provisional-items.component"
import { PatientsBLService } from '../patients/shared/patients.bl.service';
import { WardRequisitionItems } from './ward-requisition/phrm-ward-requisition.component';
import { WardSupplyBLService } from '../wardsupply/shared/wardsupply.bl.service';
import { WardSupplyDLService } from '../wardsupply/shared/wardsupply.dl.service';
import { PHRMStoreMainComponent } from './store/phrm-store-main.component';
import { PHRMDispensaryManageComponent } from "./setting/dispensary/phrm-dispensary-manage.component";
import { PHRMReturnToSupplierReportComponent } from './report/return-to-supplier/phrm-return-to-supplier-report.component';
import { PHRMTransferToStoreReportComponent } from './report/transfer-store/phrm-transfer-to-store-report.component';
import { PHRMTransferToDispensaryReportComponent } from './report/transfer-dispensary/phrm-transfer-to-dispensary-report.component';
import { PHRMAccountingMainComponent } from './accounting/phrm-accounting-main.component';
import { PHRMSuppliersListComponent } from './accounting/phrm-acc-supplier-list.component';
import { PHRMDepositBalanceReport } from './report/deposit/phrm-deposit-balance-report.component';
import { PHRMSalesDetailsListComponent } from './store/sales-category/phrm-sales-category-list.component';
import { PHRMSettlementComponent } from './sale/settlement/settlement.component';
import { PHRMSettlementReceiptComponent } from './sale/settlement/settlement-receipt/phrm-settlement-receipt.component';
import { PHRMStoreRequisitionListComponent } from './store/dispensary-request/phrm-store-requisition-list.component';
import { PHRMStoreRequisitionDetailsComponent } from './store/dispensary-request/phrm-store-requisition-details.component';
import { PHRMStoreDispatchItemsComponent } from './store/dispensary-dispatch/phrm-store-dispatch-items.component';
import { PHRMStoreDispatchDetailsComponent } from './store/dispensary-dispatch/phrm-store-dispatch-details.components';
import { SettingsSharedModule } from '../settings-new/settings-shared.module';
import { PHRMNarcoticsDailySalesReportComponent } from './report/narcotics/phrm-narcotics-daily-sales-report.component ';
import { PHRMNarcoticsStockReportComponent } from './report/narcotics/phrm-narcotics-stock-report.component';
import { PharmacyDuplicatePrintsMainComponent } from './duplicate-prints/pharmacy-duplicate-prints-main.component';
import { PHRMReturnInvoiceDuplicatePrintComponent } from './duplicate-prints/return-invoice/return-invoice.component'
import { PHRMProvisionalReturnComponent } from './duplicate-prints/provisional-return/provisional-return.component';
import { PHRMSettlementDuplicateComponent } from './duplicate-prints/settlement/settlement-duplicate.component';
import { PHRMCreditOrganizationsComponent } from '../pharmacy/setting/credit-organization/phrm-credit-organizations.component';
import { CreditOrganizationListComponent } from './setting/credit-organization/phrm-credit-organizations-list.component';
import { PHRMRackStockDistributionReportComponent } from './report/rack-stock/phrm-rack-stock-distribution-report.component';
import { PHRMUpdateExpiryDateandBatchNoComponent } from './setting/expiry-batch/phrm-update-exp-batch.component ';
import { PHRMGoodsReceiptItemComponent } from './order/phrm-gr-item/phrm-gr-item.component';
import { PHRMGoodsReceiptComponent } from './order/phrm-gr/phrm-goods-receipt.component';
import { PHRMGoodReceiptViewComponent } from './order/phrm-gr-view/phrm-goods-receipt-view.component';
import { PatientSharedModule } from '../patients/patient-shared.module';
import { DispensaryRequisitionEndpoint } from '../dispensary/dispensary-main/stock-main/requisition/dispensary-requisition-endpoint';
import { DispensaryRequisitionService } from '../dispensary/dispensary-main/stock-main/requisition/dispensary-requisition.service';
import { DirectDispatchComponent } from './store/direct-dispatch/direct-dispatch.component';
import { PharmacyPOService } from './order/pharmacy-po.service';
import { PharmacyPOEndpoint } from './order/pharmacy-po.endpoint';
import { PhrmPoViewNpComponent } from './order/phrm-po-view-np/phrm-po-view-np.component';
import { PhrmGRViewNpComponent } from './order/phrm-gr-view/phrm-gr-view-np.component';
import { ReceiveIncomingStock } from './store/store-details/incoming-stock/receive-incoming-stock/receive-incoming-stock.component';
import { TransferService } from '../dispensary/dispensary-main/stock-main/transfer-main/transfer.service';
import { TransferEndpointService } from '../dispensary/dispensary-main/stock-main/transfer-main/transfer-endpoint.service';
import { PhrmIncomingStockListComponent } from './store/store-details/incoming-stock/phrm-incoming-stock-list.component';
import { WriteOffItemComponent } from './store/write-off/write-off-item/write-off-item.component';
import { WriteOffListComponent } from './store/write-off/write-off-list/write-off-list.component';
import { ItemWisePurchaseReportComponent } from './report/item-wise-purchase-report/item-wise-purchase-report.component';
import { DatewisePurchaseReportComponent } from './report/datewise-purchase-report/datewise-purchase-report.component';
import { ReturnFromCustomerComponent } from './report/return-from-customer/return-from-customer.component';
import { PHRMStockSummaryReportComponent } from './report/stock-summary/phrm-stock-summary-report.component';
import { ItemTxnSummaryComponent } from './report/stock-summary/item-txn-summary/item-txn-summary.component';
import { PHRMPurchaseReportComponent } from './report/phrm-purchase-report/phrm-purchase-report.component';
import { PHRMSalesReportComponent } from './report/phrm-sales-report/phrm-sales-report.component';
import { PHRMStockReportComponent } from './report/phrm-stock-report/phrm-stock-report.component';
import { PHRMSupplierReportComponent } from './report/phrm-supplier-report/phrm-supplier-report.component';
import { PHRMSalesStatementComponent } from './report/phrm-sales-report/sales-statement/phrm-sales-statement.component';
import { PhrmInsBimaReportComponent } from './report/phrm-sales-report/ins-bima-report/phrm-ins-bima-report.component';
import { SupplierLedgerComponent } from './supplier-ledger/supplier-ledger.component';
import { SupplierLedgerViewComponent } from './supplier-ledger/supplier-ledger-view/supplier-ledger-view.component';
import { PHRMSalesSummaryComponent } from './report/phrm-sales-report/sales-summary/phrm-sales-summary.component';
import { PHRMPurchaseSummaryComponent } from './report/phrm-purchase-report/purchase-summary/phrm-purchase-summary.component';
import { PHRMStockSummarySecondComponent } from './report/phrm-stock-report/stock-summary-second/phrm-stock-summary-second.component';
import { PHRMPatientSalesDetailComponent } from './report/phrm-sales-report/patient-sales-detail/phrm-patient-sales-detail.component';
import { SupplierLedgerService } from './supplier-ledger/supplier-ledger.service';
import { StockTransfersReportComponent } from './report/phrm-stock-report/stock-transfers-report/stock-transfers-report.component';
import { SupplierWisePurchaseReportComponent } from './report/supplierwise-purchase-report/supplierwise-purchase-report.component';
import { StockLedgerReportComponent } from './report/stock-ledger-report/stock-ledger-report.component';
import { SalesReturnInvoiceViewComponent } from '../dispensary/dispensary-main/sales-main/sales-return/sales-return-invoice-view/sales-return-invoice-view.component';
import { SupplierWiseStockReportComponent } from './report/phrm-supplier-report/supplierwise-stock-report/supplierwise-stock-report.component';
import { PHRMSettlementSummaryReportComponent } from './report/settlement-summary-report/phrm-settlement-summary-report.component';

@NgModule({
  providers: [
    PharmacyBLService,
    PharmacyDLService,
    PharmacyService,
    ReportingService,
    PhrmRackService,
    PhrmRackEndPoint,
    VisitDLService,//remove this later: sud:4sept'18
    PatientsDLService,//remove this later: sud:4sept'18
    AppointmentDLService,//remove this later: sud:4sept'18
    BillingDLService,//remove this later: sud:4sept'18
    ADT_DLService,//remove this later: sud:4sept'18
    PatientsBLService,
    WardSupplyBLService,
    WardSupplyDLService,
    PharmacyPOService, PharmacyPOEndpoint, SupplierLedgerService,
    DispensaryRequisitionService, DispensaryRequisitionEndpoint, TransferService, TransferEndpointService,
    { provide: LocationStrategy, useClass: HashLocationStrategy }],
  imports: [PharmacyRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    // Ng2AutoCompleteModule,
    SharedModule,
    DanpheAutoCompleteModule,
    SettingsSharedModule,
    PatientSharedModule
  ],
  declarations: [
    //All components here
    PharmacyMainComponent,
    PHRMBillingMainComponent,
    PHRMOrderMainComponent,
    PHRMPrescriptionMainComponent,
    PHRMReportMainComponent,
    PHRMSettingMainComponent,
    PHRMAccountingMainComponent,
    PHRMSupplierManageComponent,
    PHRMPurchaseOrderComponent,
    PHRMPrescriptionComponent,
    PHRMPurchaseOrderListComponent,
    PHRMGoodsReceiptComponent,
    PHRMGoodsReceiptItemComponent,
    PHRMGoodsReceiptListComponent,
    PHRMTAXManageComponent,
    PHRMPurchaseOrderReportComponent,
    PHRMItemWiseStockReportComponent,
    PHRMPrescriptionListComponent,
    PharmacyDashboardComponent,
    PHRMReceiptPrintComponent,
    PHRMDailySalesSummaryComponent,
    PHRMSupplierInformationReportComponent,
    PHRMCreditInOutPatientReportComponent,
    PHRMStockItemsReportComponent,
    PHRMSupplierStockSummaryReportComponent,
    PHRMStockMovementReportComponent,
    PHRMBatchStockReportComponent,
    PHRMSupplierStockReportComponent,
    PHRMEndingStockSummaryReportComponent,
    PHRMBillingReportComponent,
    PHRMDailyStockSummaryReportComponent,
    PHRMExpiryReportComponent,
    PHRMMinStockComponent,
    // PHRMGenericManageComponent,
    PHRMABCVEDReportComponent,
    PharmacyCounterActivateComponent,
    PHRMUserwiseCollectionReportComponent,
    PHRMCounterwiseCollectionReportComponent,
    PHRMSaleReturnReportComponent,
    phrmitemaddComponent,
    PHRMBreakageItemReportComponent,
    PHRMGoodsReceiptProductReportComponent,
    PHRMCompanyAddComponent,
    PHRMGenericAddComponent,
    PHRMGoodsReceiptProductReportComponent,
    PhrmRackComponent,
    PhrmRackAddComponent,
    PhrmRackDrugListComponent,
    PHRMCreditBillsComponent,
    PhrmRackDrugListComponent,
    //PrintHeaderComponent,
    PHRMStockManageReportComponent,
    PHRMProvisionalItems,
    WardRequisitionItems,
    PHRMStoreMainComponent,
    PHRMStoreDetailsListComponent,
    PHRMReturnItemToSupplierListComponent,
    PHRMReturnItemsToSupplierComponent,
    PHRMDispensaryManageComponent,
    PHRMReturnToSupplierReportComponent,
    PHRMTransferToStoreReportComponent,
    PHRMTransferToDispensaryReportComponent,
    PHRMSuppliersListComponent,
    PHRMDrugCategoryWiseReportComponent,
    PHRMDepositBalanceReport,
    PHRMSalesDetailsListComponent,
    PHRMSettlementComponent,
    PHRMSettlementReceiptComponent,
    PHRMCashCollectionSummaryReportComponent,
    PHRMStoreRequisitionListComponent,
    PHRMStoreRequisitionDetailsComponent,
    PHRMStoreDispatchItemsComponent,
    PHRMStoreDispatchDetailsComponent,
    PharmacyDuplicatePrintsMainComponent,
    PHRMReturnInvoiceDuplicatePrintComponent,
    PHRMProvisionalReturnComponent,
    PHRMStoreDispatchDetailsComponent,
    PHRMNarcoticsDailySalesReportComponent,
    PHRMNarcoticsStockReportComponent,
    PHRMSettlementDuplicateComponent,
    PHRMCreditOrganizationsComponent,
    CreditOrganizationListComponent,
    PHRMRackStockDistributionReportComponent,
    PHRMUpdateExpiryDateandBatchNoComponent,
    // PatientDuplicateWarningBox,
    ItemTxnSummaryComponent,
    PHRMStockSummaryReportComponent,
    PHRMGoodsReceiptItemComponent,
    PHRMGoodReceiptViewComponent,
    PhrmPoViewNpComponent,
    DirectDispatchComponent,
    PhrmGRViewNpComponent,
    ReceiveIncomingStock,
    PhrmIncomingStockListComponent,
    WriteOffItemComponent,
    WriteOffListComponent,
    ItemWisePurchaseReportComponent,
    DatewisePurchaseReportComponent,
    ReturnFromCustomerComponent,
    PHRMPurchaseReportComponent,
    PHRMSalesReportComponent,
    PHRMStockReportComponent,
    PHRMSupplierReportComponent,
    PHRMSalesStatementComponent,
    PhrmInsBimaReportComponent,
    SupplierLedgerComponent,
    SupplierLedgerViewComponent,
    PHRMSalesSummaryComponent,
    PHRMPurchaseSummaryComponent,
    PHRMStockSummarySecondComponent,
    PHRMPatientSalesDetailComponent,
    StockTransfersReportComponent,
    SupplierWisePurchaseReportComponent,
    StockLedgerReportComponent,
    SalesReturnInvoiceViewComponent,
    SupplierWiseStockReportComponent,
    PHRMSettlementSummaryReportComponent



  ],
  bootstrap: []
})
export class PharmacyModule { }

