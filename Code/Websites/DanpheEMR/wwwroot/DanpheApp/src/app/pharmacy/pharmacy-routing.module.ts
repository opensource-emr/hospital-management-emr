import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";

import { PharmacyMainComponent } from "./pharmacy-main.component";
import { PHRMBillingMainComponent } from "./billing/phrm-billing-main.component";
import { PHRMOrderMainComponent } from "./order/phrm-order-main.component";
import { PHRMPatientMainComponent } from "./patient/phrm-patient-main.component";
import { PHRMPrescriptionMainComponent } from "./prescription/phrm-prescription-main.component";
import { PHRMReportMainComponent } from "./report/phrm-report-main.component";
import { SaleMainComponent } from "./sale/phrm-sale-main.component";
import { StockMainComponent } from "./stock/stock-main.component";
import { PHRMSettingMainComponent } from "./setting/phrm-setting-main.component";
import { PHRMPurchaseOrderListComponent } from "./order/phrm-po-list/phrm-purchase-order-list.component";
import { PHRMSupplierManageComponent } from "./setting/supplier/phrm-supplier-manage.component";
import { PHRMPurchaseOrderComponent } from "./order/phrm-po/phrm-purchase-order.component";
import { PHRMCompanyManageComponent } from "./setting/company/phrm-company-manage.component";
import { PHRMCategoryManageComponent } from "./setting/category/phrm-category-manage.component";
import { PHRMUnitOfMeasurementManageComponent } from "./setting/uom/phrm-uom-manage.component";
import { PHRMItemTypeManageComponent } from "./setting/item-type/phrm-item-type-manage.component";
import { PHRMItemMasterManageComponent } from "./setting/item/phrm-item-manage.component";
import { PHRMGenericManageComponent } from "./setting/generic/phrm-generic-manage.component";
import { PHRMPatientListComponent } from "./patient/phrm-patient-list.component";
import { PHRMPatientComponent } from "./patient/phrm-patient.component";
import { PHRMGoodsReceiptListComponent } from "./order/phrm-gr-list/phrm-goods-receipt-list.component";
import { PHRMTAXManageComponent } from "./setting/tax/phrm-tax-manage.component";
import { PHRMPurchaseOrderReportComponent } from "./report/po/phrm-purchase-order-report.component"
import { PHRMItemWiseStockReportComponent } from "./report/itemwise-stock/phrm-itemwise-stock-report.component";
import { PHRMPrescriptionListComponent } from "./prescription/phrm-prescription-list.component";
import { PharmacyDashboardComponent } from "../dashboards/pharmacy/pharmacy-dashboard.component";
import { PHRMStockDetailsListComponent } from "./stock/phrm-stock-details-list.component";
import { PHRMWriteOffItemComponent } from "./stock/write-off/phrm-write-off-items.component";
import { PHRMWriteOffListComponent } from "./stock/write-off/phrm-write-off-items-list.component";
import { PHRMSaleComponent } from "./sale/phrm-sale.component";
import { PHRMSaleListComponent } from "./sale/phrm-sale-list.component";
import { PHRMStockManageComponent } from "./stock/phrm-stock-manage.component";
import { PHRMStockBatchItemListComponent } from "./stock/phrm-stock-batch-item-list.component";
import { PHRMSaleCreditComponent } from "./sale/phrm-sale-credit.component"
import { PHRMSaleReturnComponent } from "./sale/phrm-sale-return.component";
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
import { PHRMUserwiseCollectionReportComponent } from './report/user-collection/phrm-userwise-collection-report.component';
import { PHRMCounterwiseCollectionReportComponent } from './report/counter-collection/phrm-counterwise-collection-report.component';
import { PHRMCashCollectionSummaryReportComponent } from './report/cash-collection/phrm-cashcollection-summary-report.component '
import { PHRMReturnListComponent } from './sale/phrm-return-list.component';
import { PHRMSaleReturnReportComponent } from './report/sales-return/phrm-sale-return-report.component';
import { PHRMBreakageItemReportComponent } from "./report/breakage-items/phrm-breakage-item-report.component";
import { PHRMGoodsReceiptProductReportComponent } from "./report/gr-products/phrm-good-receipt-product-report.component";
import { PHRMStockManageReportComponent } from "./report/stock-manage/phrm-stock-manage-report.component";
import { PhrmRackComponent } from './rack/phrm-rack.component';
import { PHRMCreditBillsComponent } from './sale/credit-billing/phrm-credit-bills.component';
import { PHRMProvisionalItems } from "./provisional-items/phrm-provisional-items.component"
import { PHRMDispatchComponent } from './sale/phrm-dispatch.component';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { WardRequisitionItems } from './ward-requisition/phrm-ward-requisition.component';
import { PHRMStoreDetailsListComponent } from './store/store-details/phrm-store-details-list.component';
import { PHRMReturnItemsToSupplierComponent } from "./store/return-to-supplier/phrm-return-items-to-supplier.component";
import { PHRMReturnItemToSupplierListComponent } from "./store/return-to-supplier/phrm-return-item-to-supplier-list.component";
import { PHRMStoreMainComponent } from './store/phrm-store-main.component';
import { PHRMDispensaryManageComponent } from "./setting/dispensary/phrm-dispensary-manage.component";
import { PHRMDrugCategoryWiseReportComponent } from "./report/drug-category/phrm-drug-categorywise-report.component"
import { PHRMAccountingMainComponent } from './accounting/phrm-accounting-main.component';
import { PHRMSuppliersListComponent } from './accounting/phrm-acc-supplier-list.component';
import { PHRMReturnToSupplierReportComponent } from './report/return-to-supplier/phrm-return-to-supplier-report.component';
import { PHRMTransferToStoreReportComponent } from './report/transfer-store/phrm-transfer-to-store-report.component';
import { PHRMTransferToDispensaryReportComponent } from './report/transfer-dispensary/phrm-transfer-to-dispensary-report.component';
import { PHRMDepositBalanceReport } from './report/deposit/phrm-deposit-balance-report.component';
import { PHRMSalesDetailsListComponent } from './store/sales-category/phrm-sales-category-list.component';
import { PHRMSettlementComponent } from './sale/settlement/settlement.component';
import { PHRMRequisitionListComponent } from './stock/requisition/phrm-requisition-list.component';
import { PHRMRequisitionItemsComponent } from './stock/requisition/phrm-requisition-items.component';
import { PHRMRequisitionDetailsComponent } from './stock/requisition/phrm-requisition-details.component';
import { PHRMStoreRequisitionListComponent } from './store/dispensary-request/phrm-store-requisition-list.component';
import { PHRMStoreRequisitionDetailsComponent } from './store/dispensary-request/phrm-store-requisition-details.component';
import { PHRMStoreDispatchItemsComponent } from './store/dispensary-dispatch/phrm-store-dispatch-items.component';
import { PHRMStoreDispatchDetailsComponent } from './store/dispensary-dispatch/phrm-store-dispatch-details.components';
import { PharmacyDuplicatePrintsMainComponent } from './duplicate-prints/pharmacy-duplicate-prints-main.component';
import { PHRMReturnInvoiceDuplicatePrintComponent } from './duplicate-prints/return-invoice/return-invoice.component';
import { PHRMProvisionalReturnComponent } from './duplicate-prints/provisional-return/provisional-return.component';
import { PHRMNarcoticsDailySalesReportComponent } from './report/narcotics/phrm-narcotics-daily-sales-report.component ';
import { PHRMNarcoticsStockReportComponent } from './report/narcotics/phrm-narcotics-stock-report.component';
import { PHRMSettlementDuplicateComponent } from './duplicate-prints/settlement/settlement-duplicate.component';

import { PageNotFound } from '../404-error/404-not-found.component';
import { TermsListComponent } from '../inventory/settings/termsconditions/terms-list.component';
import { CreditOrganizationListComponent } from './setting/credit-organization/phrm-credit-organizations-list.component';
import { PHRMRackStockDistributionReportComponent } from './report/rack-stock/phrm-rack-stock-distribution-report.component';
import { InvoiceHeaderListComponent } from '../shared/invoice-header/invoice-header-list.component';
import { PHRMPackingTypeListComponent } from './setting/packing-type/phrm-packing-type-list.component';
import { PHRMGoodsReceiptComponent } from './order/phrm-gr/phrm-goods-receipt.component';
import { PHRMStockSummaryReportComponent } from './report/stock-summary/phrm-stock-summary-report.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: PharmacyMainComponent, canActivate: [AuthGuardService],

        children: [
          { path: '', redirectTo: 'Dashboard', pathMatch: 'full' },
          { path: 'Dashboard', component: PharmacyDashboardComponent, canActivate: [AuthGuardService] },
          { path: 'Billing', component: PHRMBillingMainComponent, canActivate: [AuthGuardService] },
          {
            path: 'Order',
            component: PHRMOrderMainComponent,
            children: [
              { path: '', redirectTo: 'GoodsReceiptItems', pathMatch: 'full' },
              { path: 'PurchaseOrderItems', component: PHRMPurchaseOrderComponent },
              { path: 'PurchaseOrderList', component: PHRMPurchaseOrderListComponent },
              { path: 'GoodsReceiptItems', component: PHRMGoodsReceiptComponent },
              { path: 'GoodsReceiptList', component: PHRMGoodsReceiptListComponent },
              { path: "**", component: PageNotFound }

            ]
          },
          {
            path: 'Supplier',
            component: PHRMAccountingMainComponent,
            children: [
              { path: '', redirectTo: 'PharmacySuppliersList', pathMatch: 'full' },
              { path: 'PharmacySuppliersList', component: PHRMSuppliersListComponent },
              { path: "**", component: PageNotFound }

            ]
          },
          {
            path: 'Patient',
            component: PHRMPatientMainComponent,
            children: [
              { path: '', redirectTo: 'List', pathMatch: 'full' },
              { path: 'List', component: PHRMPatientListComponent },
              { path: 'New', component: PHRMPatientComponent },
              { path: "**", component: PageNotFound }

            ]
          },
          {
            path: 'Prescription',
            component: PHRMPrescriptionMainComponent,
            children: [
              { path: '', redirectTo: 'List', pathMatch: 'full' },
              { path: 'List', component: PHRMPrescriptionListComponent },
              { path: "**", component: PageNotFound }

              //{ path: 'New', component: PHRMPrescriptionComponent, canDeactivate: [ResetPatientcontextGuard] }
            ]
          },
          {
            path: 'Report', component: PHRMReportMainComponent
          },
          { path: 'Report/PurchaseOrderReport', component: PHRMPurchaseOrderReportComponent },
          { path: 'Report/ItemWiseStockReport', component: PHRMItemWiseStockReportComponent },
          { path: 'Report/SupplierInfoReport', component: PHRMSupplierInformationReportComponent },
          { path: 'Report/LedgerCreditInOutPatientReport', component: PHRMCreditInOutPatientReportComponent },
          { path: 'Report/StockItemsReport', component: PHRMStockItemsReportComponent },
          { path: 'Report/SupplierStockSummaryReport', component: PHRMSupplierStockSummaryReportComponent },
          { path: 'Report/StockMovementReport', component: PHRMStockMovementReportComponent },
          { path: 'Report/BatchStockReport', component: PHRMBatchStockReportComponent },
          { path: 'Report/SupplierStockReport', component: PHRMSupplierStockReportComponent },
          { path: 'Report/EndingStockSummary', component: PHRMEndingStockSummaryReportComponent },
          { path: 'Report/BillingReport', component: PHRMBillingReportComponent },
          { path: 'Report/DailyStockSummaryReport', component: PHRMDailyStockSummaryReportComponent },
          { path: 'Report/ExpiryReport', component: PHRMExpiryReportComponent },
          { path: 'Report/PHRMMinStock', component: PHRMMinStockComponent },
          { path: 'Report/PHRMDailySalesSummary', component: PHRMDailySalesSummaryComponent },
          { path: 'Report/ABCVEDStock', component: PHRMABCVEDReportComponent },
          { path: 'Report/UserwiseCollectionReport', component: PHRMUserwiseCollectionReportComponent },
          { path: 'Report/CounterwiseCollectionReport', component: PHRMCounterwiseCollectionReportComponent },
          { path: 'Report/CashCollectionSummaryReport', component: PHRMCashCollectionSummaryReportComponent },
          { path: 'Report/SaleReturnReport', component: PHRMSaleReturnReportComponent },
          { path: 'Report/BreakageItemReport', component: PHRMBreakageItemReportComponent },
          { path: 'Report/GoodsReceiptProductReport', component: PHRMGoodsReceiptProductReportComponent },
          { path: 'Report/StockManageDetailReport', component: PHRMStockManageReportComponent },
          { path: 'Report/DrugCategoryWiseReport', component: PHRMDrugCategoryWiseReportComponent },
          { path: 'Report/ReturnToSupplierReport', component: PHRMReturnToSupplierReportComponent },
          { path: 'Report/TransferToStoreReport', component: PHRMTransferToStoreReportComponent },
          { path: 'Report/TransferToDispensaryReport', component: PHRMTransferToDispensaryReportComponent },
          { path: 'Report/DepositBalanceReport', component: PHRMDepositBalanceReport },
          { path: 'Report/PHRMNarcoticsDailySalesReport', component: PHRMNarcoticsDailySalesReportComponent },
          { path: 'Report/PHRMNarcoticsStockReport', component: PHRMNarcoticsStockReportComponent },
          { path: 'Report/PHRMRackStockDistributionReport', component: PHRMRackStockDistributionReportComponent },
          { path: 'Report/StockSummaryReport', component: PHRMStockSummaryReportComponent },
          //{ path: 'Report/StoreStockReport', component: PHRMStoreStockReportComponent },
          {
            path: 'Sale',
            component: SaleMainComponent,
            children: [
              { path: '', redirectTo: 'New', pathMatch: 'full' },
              { path: 'List', component: PHRMSaleListComponent },
              { path: 'New', component: PHRMSaleComponent },
              { path: 'Dispatch', component: PHRMDispatchComponent },
              { path: 'SaleCredit', component: PHRMSaleCreditComponent },
              { path: 'Return', component: PHRMSaleReturnComponent },
              { path: 'ReceiptPrint', component: PHRMReceiptPrintComponent },
              { path: 'ReturnList', component: PHRMReturnListComponent },
              { path: 'CreditBills', component: PHRMCreditBillsComponent },
              { path: 'Settlement', component: PHRMSettlementComponent },
              { path: 'ProvisionalReturn', component: PHRMProvisionalReturnComponent, canActivate: [AuthGuardService] },
              { path: "**", component: PageNotFound }

            ]
          },
          {
            path: 'Stock',
            component: StockMainComponent,
            children: [

              { path: '', redirectTo: 'StockDetails', pathMatch: 'full' },
              { path: 'StockDetails', component: PHRMStockDetailsListComponent },
              { path: 'WriteOffItems', component: PHRMWriteOffItemComponent },
              { path: 'WriteOffItemsList', component: PHRMWriteOffListComponent },
              { path: 'StockManage', component: PHRMStockManageComponent },
              { path: 'ViewStockBatchItems', component: PHRMStockBatchItemListComponent },
              { path: 'StoreRequisition', component: PHRMRequisitionListComponent },
              { path: 'StoreRequisitionItems', component: PHRMRequisitionItemsComponent },
              { path: 'StoreRequisitionDetails', component: PHRMRequisitionDetailsComponent },
              { path: "**", component: PageNotFound }


            ]
          },
          {
            path: 'Setting',
            component: PHRMSettingMainComponent,

            children: [
              { path: '', redirectTo: 'ItemManage', pathMatch: 'full' },
              { path: 'SupplierManage', component: PHRMSupplierManageComponent },
              { path: 'CompanyManage', component: PHRMCompanyManageComponent },
              { path: 'CategoryManage', component: PHRMCategoryManageComponent },
              { path: 'UnitOfMeasurementManage', component: PHRMUnitOfMeasurementManageComponent },
              { path: 'ItemTypeManage', component: PHRMItemTypeManageComponent },
              { path: 'ItemManage', component: PHRMItemMasterManageComponent },
              { path: 'TAXManage', component: PHRMTAXManageComponent },
              { path: 'GenericManage', component: PHRMGenericManageComponent },
              { path: 'RackSetting', component: PhrmRackComponent },
              { path: 'Dispensary', component: PHRMDispensaryManageComponent },
              { path: 'CreditOrganizations', component: CreditOrganizationListComponent },
              { path: 'TermsList/:id', component: TermsListComponent },
              { path: 'InvoiceHeaders/:module', component: InvoiceHeaderListComponent },
              { path: 'Packing', component: PHRMPackingTypeListComponent },
              { path: "**", component: PageNotFound }
            ]
          },
          { path: 'ProvisionalItems', component: PHRMProvisionalItems },
          { path: 'ActivateCounter', component: PharmacyCounterActivateComponent },
          { path: 'WardRequisition', component: WardRequisitionItems },

          {
            path: 'Store',
            component: PHRMStoreMainComponent,
            children: [
              { path: '', redirectTo: 'StoreDetails', pathMatch: 'full' },
              { path: 'ReturnItemsToSupplier', component: PHRMReturnItemsToSupplierComponent },
              { path: 'ReturnItemsToSupplierList', component: PHRMReturnItemToSupplierListComponent },
              { path: 'StoreDetails', component: PHRMStoreDetailsListComponent },
              { path: 'SalesCategoryList', component: PHRMSalesDetailsListComponent },
              { path: 'StoreRequisition', component: PHRMStoreRequisitionListComponent },
              { path: 'StoreRequisitionDetails', component: PHRMStoreRequisitionDetailsComponent },
              { path: 'StoreDispatch', component: PHRMStoreDispatchItemsComponent },
              { path: 'StoreDispatchDetails', component: PHRMStoreDispatchDetailsComponent },
              { path: "**", component: PageNotFound }

            ]
          },
          {
            path: 'DuplicatePrints', component: PharmacyDuplicatePrintsMainComponent,
            children: [
              { path: '', redirectTo: 'InvoiceReturn', pathMatch: 'full' },
              { path: 'InvoiceReturn', component: PHRMReturnInvoiceDuplicatePrintComponent, canActivate: [AuthGuardService] },
              { path: 'ProvisionalReturn', component: PHRMProvisionalReturnComponent, canActivate: [AuthGuardService] },
              { path: 'SettlementDuplicate', component: PHRMSettlementDuplicateComponent, canActivate: [AuthGuardService] },
              { path: "**", component: PageNotFound }

            ]

          },
          { path: "**", component: PageNotFound }


        ]
      },
      { path: "**", component: PageNotFound }
    ])
  ],
  exports: [
    RouterModule
  ]
})

export class PharmacyRoutingModule {

}
