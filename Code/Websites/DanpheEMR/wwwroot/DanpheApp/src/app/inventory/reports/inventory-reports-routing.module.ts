import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";

import { InventoryReportsComponent } from "./inventory-reports.component";
import { StockLevelComponent } from './inv-stock-report-main/stock-level/stock-level.component';
import { DailyItemDispatchComponent } from './dispatch-level/daily-item-dispatch.component';
import { PurchaseOrderSummaryComponent } from './purchase-order-level/purchase-order-summary.component';
import { InventorySummaryComponent } from './inventory-summary/inventory-summary.component'
import { InventoryValuationComponent } from './inventory-valuation/inventory-valuation.component';
import { ComparisonPOGR } from './inv-purchase-report-main/comparisonPO-GR/comparisonPO-GR.component'
import { PurchaseReport } from './inv-purchase-report-main/purchase-report/purchase-report.component';
import { WriteOffComponent } from './write-off-report/write-off.component';
import { ReturnToVendorComponent } from './return-to-vendor/return-to-vendor-report.component';
import { FixedAssetsComponent } from './fixed-assets/fixed-assets.component';
import { CancelledPOandGR } from './inv-purchase-report-main/cancelledPO-GR/cancelledPOandGR.component';
import { GoodReceiptEvaluation } from './goodreceipt-evaluation/GoodReceiptEvaluation.component';
import { VendorTransactionReportComponent } from './vender-transaction-report/Vendor-transaction-report.component';
import { ItemMgmtDetailComponent } from '../../inventory/reports/itm-mgmt-detail/itm-mgmt-detail.component';
import { SubstoreStockReportComponent } from './inv-stock-report-main/substore-stock/substore-stock.component';
import { INVPurchaseItemsSummeryReport } from './purchase-items-summary/inv-purchase-items-summary.component';
import { PurchaseSummaryComponent } from './inv-purchase-report-main/purchase-summary/inv-purchase-summary.component';
import { ApprovedMaterialStockRegisterComponent } from './approved-material-stock-register/approved-material-stock-register.component';
import { InventoryValueByItemCategoryComponent } from './Inventory-Value-By-Item-Category/inventory-value-by-item-category.component';

import { DetailStockLedgerComponent } from './inv-stock-report-main/detail-stock-ledger/detail-stock-ledger.component';
import { InvPurchaseReportMainComponent } from './inv-purchase-report-main/inv-purchase-report-main.component';
import { InvStockReportMainComponent } from './inv-stock-report-main/inv-stock-report-main.component';
import { InvSupplierReportMainComponent } from './inv-supplier-report-main/inv-supplier-report-main.component';
import { SupplierWiseStockReportComponent } from './inv-supplier-report-main/supplier-wise-stock/supplier-wise-stock-report.component';
import { ReturnToSupplierComponent } from './inv-purchase-report-main/returnToSupplier/returnToSupplier.component';
import { ExpiryItemComponent } from './expiry-item/expiry-item.component';
import { INVSupplierInfoReportComponent } from './inv-supplier-report-main/Supplier-Information/supplier-information-report.component';
@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '', component: InventoryReportsComponent, children: [
          {
            path: 'Purchase', children: [
              { path: '', component: InvPurchaseReportMainComponent },
              { path: 'PurchaseItems', component: INVPurchaseItemsSummeryReport },
              { path: 'CancelledPOandGR', component: CancelledPOandGR },
              { path: 'ComparisonPOGR', component: ComparisonPOGR },
              { path: 'PurchaseOrder', component: PurchaseOrderSummaryComponent },
              { path: 'PurchaseReports', component: PurchaseReport },
              { path: 'ReturnToVendor', component: ReturnToVendorComponent },
              { path: 'FixedAssets', component: FixedAssetsComponent },
              { path: 'PurchaseSummary', component: PurchaseSummaryComponent },
              { path: 'ReturnToSupplier', component: ReturnToSupplierComponent },         
            ]
          },
          {
            path: 'Stock', children: [
              { path: '', component: InvStockReportMainComponent },
              { path: 'DetailStockLedger', component: DetailStockLedgerComponent },
              { path: 'InventorySummary', component: InventorySummaryComponent },
              { path: 'InventoryValuation', component: InventoryValuationComponent },
              { path: 'DailyItemDispatch', component: DailyItemDispatchComponent },
              { path: 'WriteOff', component: WriteOffComponent },
              { path: 'ItemMgmtDetail', component: ItemMgmtDetailComponent },
              { path: 'SubstoreStock', component: SubstoreStockReportComponent },
              { path: 'StockLevel', component: StockLevelComponent },
              { path: 'ExpiryItem', component: ExpiryItemComponent },
            ]
          },
          {
            path: 'Supplier', children: [
              {path:'', component: InvSupplierReportMainComponent},
              {path:'SupplierWiseStock',component: SupplierWiseStockReportComponent},
              {path: 'SupplierInformationReport', component:INVSupplierInfoReportComponent}
            ]
          },

          { path: '', redirectTo: 'Stock', pathMatch: 'full' },
        ]
      },
    ]

    )],
  exports: [
    RouterModule
  ]
})

export class InventoryReportsRoutingModule {

}
