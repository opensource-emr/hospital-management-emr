import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";

//import { PharmacyDashboardComponent } from '../dashboards/pharmacy/pharmacy-dashboard.component';
import { ResetPatientcontextGuard } from '../shared/reset-patientcontext-guard';
import { PharmacyMainComponent } from "./pharmacy-main.component"
import { BillingMainComponent } from "./billing/billing-main.component"
import { OrderMainComponent } from "./order/order-main.component"
import { PatientMainComponent } from "./patient/patient-main.component"
import { PrescriptionMainComponent } from "./prescription/prescription-main.component"
import { ReportMainComponent } from "./report/report-main.component"
import { SaleMainComponent } from "./sale/sale-main.component"
import { StockMainComponent } from "./stock/stock-main.component"
import { SettingMainComponent } from "./setting/setting-main.component"
import { PHRMPurchaseOrderListComponent } from "./order/phrm-purchase-order-list.component"
import { PHRMSupplierManageComponent } from "./setting/phrm-supplier-manage.component"
import { PHRMPurchaseOrderItemsComponent } from "./order/phrm-purchase-order-items.component"
import { PHRMCompanyManageComponent } from "./setting/phrm-company-manage.component"
import { PHRMCategoryManageComponent } from "./setting/phrm-category-manage.component"
import { PHRMUnitOfMeasurementManageComponent } from "./setting/phrm-unit-of-measurement-manage.component"
import { PHRMItemTypeManageComponent } from "./setting/phrm-item-type-manage.component"
import { PHRMItemMasterManageComponent } from "./setting/phrm-item-manage.component"
import { PHRMGenericManageComponent } from "./setting/phrm-generic-manage.component"
import { PHRMPatientListComponent } from "./patient/phrm-patient-list.component"
import { PHRMPatientComponent } from "./patient/phrm-patient.component"
import { PHRMPrescriptionComponent } from "./prescription/phrm-prescription.component"
import { PHRMGoodsReceiptListComponent } from "./order/phrm-goods-receipt-list.component"
import { PHRMTAXManageComponent } from "./setting/phrm-tax-manage.component"
import { PHRMPurchaseOrderReportComponent } from "./report/phrm-purchase-order-report.component"
import { PHRMItemWiseStockReportComponent } from "./report/phrm-itemwise-stock-report.component"
import { PHRMGoodsReceiptItemsComponent } from "./order/phrm-goods-receipt-items.component"
import { PHRMPrescriptionListComponent } from "./prescription/phrm-prescription-list.component";
import { PharmacyDashboardComponent } from "../dashboards/pharmacy/pharmacy-dashboard.component";
import { PHRMStockDetailsListComponent } from "./stock/phrm-stock-details-list.component";
import { PHRMWriteOffItemComponent } from "./stock/phrm-write-off-items.component";
import { PHRMWriteOffListComponent } from "./stock/phrm-write-off-items-list.component"
import { PHRMSaleComponent } from "./sale/phrm-sale.component"
import { PHRMSaleListComponent } from "./sale/phrm-sale-list.component";
import { PHRMStockManageComponent } from "./stock/phrm-stock-manage.component";
import { PHRMStockBatchItemListComponent } from "./stock/phrm-stock-batch-item-list.component";
import { PHRMSaleCreditComponent } from "./sale/phrm-sale-credit.component"
import { PHRMSaleReturnComponent } from "./sale/phrm-sale-return.component";
import { PHRMReceiptPrintComponent } from "./sale/phrm-receipt-print.component"
import { PHRMSupplierInformationReportComponent } from './report/phrm-supplier-information-report.component';
import { PHRMCreditInOutPatientReportComponent } from './report/phrm-credit-in-out-patient-report.component';
import { PHRMStockItemsReportComponent } from './report/phrm-stock-items-report.component';
import { PHRMSupplierStockSummaryReportComponent } from './report/phrm-supplier-stock-summary-report.component';
import { PHRMStockMovementReportComponent } from './report/phrm-stock-movement-report.component';
import { PHRMBatchStockReportComponent } from './report/phrm-batch-stock-report.component';
import { PHRMSupplierStockReportComponent } from './report/phrm-supplier-stock-report.component';
import { PHRMEndingStockSummaryReportComponent } from './report/phrm-ending-stock-summary-report.component';
import { PHRMBillingReportComponent } from './report/phrm-billing-report.component';
import { PHRMDailyStockSummaryReportComponent } from './report/phrm-daily-stock-summary-report.component';
import { PHRMExpiryReportComponent } from './report/phrm-expiry-report.component';
import { PHRMMinStockComponent } from './report/phrm-minstock.component';
import { PHRMDailySalesSummaryComponent } from './report/phrm-daily-sales-summary.component';
import { PHRMABCVEDReportComponent } from './report/phrm-abcved-report.component';
import { PharmacyCounterActivateComponent } from './counter/pharmacy-counter-activate.component'
import { PHRMStockTxnItemsManageComponent } from './setting/phrm-stock-txn-items-manage.component';
import { PHRMUserwiseCollectionReportComponent } from './report/phrm-userwise-collection-report.component';
import { PHRMCounterwiseCollectionReportComponent } from './report/phrm-counterwise-collection-report.component';
import { PHRMReturnListComponent } from './sale/phrm-return-list.component';
import { PHRMSaleReturnReportComponent } from './report/phrm-sale-return-report';
import { PHRMBreakageItemReportComponent } from "./report/phrm-breakage-item-report.component";
import { PHRMGoodsReceiptProductReportComponent } from "./report/phrm-good-receipt-product-report.component";
import { PHRMStockManageReportComponent } from "./report/phrm-stock-manage-report.component";
import { PhrmRackComponent } from './rack/phrm-rack.component';
import { PHRMCreditBillsComponent } from './sale/credit-billing/phrm-credit-bills.component';
import { PHRMProvisionalItems } from "./provisional-items/phrm-provisional-items.component"
import { PHRMDispatchComponent } from './sale/phrm-dispatch.component';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { WardRequisitionItems } from './ward-requisition/Ward-requisition.component';
import { PHRMStoreDetailsListComponent } from './store/phrm-store-details-list.component';
import { PHRMReturnItemsToSupplierComponent } from "./store/phrm-return-items-to-supplier.component";
import { PHRMReturnItemToSupplierListComponent } from "./store/phrm-return-item-to-supplier-list.component";
import { StoreMainComponent } from './store/store-main.component';
import { PHRMDispensaryManageComponent } from "./setting/phrm-dispensary-manage.component";
import { PHRMDrugCategoryWiseReportComponent } from "./report/phrm-drug-categorywise-report.component"
import { AccountingMainComponent } from './accounting/accounting-main.component';
import { PHRMSuppliersListComponent } from './accounting/phrm-acc-supplier-list.component';
import { PHRMReturnToSupplierReportComponent } from './report/phrm-return-to-supplier-report.component';
import { PHRMDepositBalanceReport } from './report/phrm-deposit-balance-report.component';
import { PHRMSalesDetailsListComponent } from './store/phrm-sales-category-list.component';
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',
        component: PharmacyMainComponent, canActivate: [AuthGuardService],

        children: [
          { path: '', redirectTo: 'Dashboard', pathMatch: 'full' },
          { path: 'Dashboard', component: PharmacyDashboardComponent, canActivate: [AuthGuardService] },
          { path: 'Billing', component: BillingMainComponent, canActivate: [AuthGuardService] },
          {
            path: 'Order',
            component: OrderMainComponent,
            children: [
              { path: '', redirectTo: 'GoodsReceiptItems', pathMatch: 'full' },
              { path: 'PurchaseOrderItems', component: PHRMPurchaseOrderItemsComponent },
              { path: 'PurchaseOrderList', component: PHRMPurchaseOrderListComponent },
              { path: 'GoodsReceiptItems', component: PHRMGoodsReceiptItemsComponent },
              { path: 'GoodsReceiptList', component: PHRMGoodsReceiptListComponent },
            ]
          },
          {
            path: 'Supplier',
            component: AccountingMainComponent,
            children: [
              { path: '', redirectTo: 'PharmacySuppliersList', pathMatch: 'full' },
              { path: 'PharmacySuppliersList', component: PHRMSuppliersListComponent },
            ]
          },
          {
            path: 'Patient',
            component: PatientMainComponent,
            children: [
              { path: '', redirectTo: 'List', pathMatch: 'full' },
              { path: 'List', component: PHRMPatientListComponent },
              { path: 'New', component: PHRMPatientComponent }
            ]
          },
          {
            path: 'Prescription',
            component: PrescriptionMainComponent,
            children: [
              { path: '', redirectTo: 'List', pathMatch: 'full' },
              { path: 'List', component: PHRMPrescriptionListComponent }
              //{ path: 'New', component: PHRMPrescriptionComponent, canDeactivate: [ResetPatientcontextGuard] }
            ]
          },
          {
            path: 'Report', component: ReportMainComponent
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
          { path: 'Report/SaleReturnReport', component: PHRMSaleReturnReportComponent },
          { path: 'Report/BreakageItemReport', component: PHRMBreakageItemReportComponent },
          { path: 'Report/GoodsReceiptProductReport', component: PHRMGoodsReceiptProductReportComponent },
          { path: 'Report/StockManageDetailReport', component: PHRMStockManageReportComponent },
          { path: 'Report/DrugCategoryWiseReport', component: PHRMDrugCategoryWiseReportComponent },
          { path: 'Report/ReturnToSupplierReport', component: PHRMReturnToSupplierReportComponent },
          { path: 'Report/DepositBalanceReport', component: PHRMDepositBalanceReport },
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

            ]
          },
          {
            path: 'Setting',
            component: SettingMainComponent,

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
              { path: 'StockTxnItemManage', component: PHRMStockTxnItemsManageComponent },
              { path: 'RackSetting', component: PhrmRackComponent },
              { path: 'Dispensary', component: PHRMDispensaryManageComponent }
            ]
          },
          { path: 'ProvisionalItems', component: PHRMProvisionalItems },
          { path: 'ActivateCounter', component: PharmacyCounterActivateComponent },
          { path: 'WardRequisition', component: WardRequisitionItems },

          {
            path: 'Store',
            component: StoreMainComponent,
            children: [
              { path: '', redirectTo: 'StoreDetails', pathMatch: 'full' },
              { path: 'ReturnItemsToSupplier', component: PHRMReturnItemsToSupplierComponent },
              { path: 'ReturnItemsToSupplierList', component: PHRMReturnItemToSupplierListComponent },
              { path: 'StoreDetails', component: PHRMStoreDetailsListComponent },
              { path: 'SalesCategoryList', component: PHRMSalesDetailsListComponent },
            ]
          },

        ]
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})

export class PharmacyRoutingModule {

}
