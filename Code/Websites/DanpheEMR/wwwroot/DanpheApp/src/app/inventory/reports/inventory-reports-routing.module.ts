import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";

import { InventoryReportsComponent } from "./inventory-reports.component";
import { StockLevelComponent } from './stock-level/stock-level.component';
import { DailyItemDispatchComponent } from './dispatch-level/daily-item-dispatch.component';
import { PurchaseOrderSummeryComponent } from './purchase-order-level/purchase-order-summery.component';
import { InventorySummaryComponent } from './inventory-summary/inventory-summary.component'
import { InventoryValuationComponent } from './inventory-valuation/inventory-valuation.component';
import { ComparisonPOGR } from './comparisonPO-GR/comparisonPO-GR.component'
import { PurchaseReport } from './purchase-report/purchase-report.component';
import { WriteOffComponent } from './write-off-report/write-off.component';
import { ReturnToVendorComponent } from './return-to-vendor/return-to-vendor-report.component';
import { FixedAssetsComponent } from './fixed-assets/fixed-assets.component';
import { CancelledPOandGR } from './cancelledPO-GR/cancelledPOandGR.component';
import { GoodReceiptEvaluation } from './goodreceipt-evaluation/GoodReceiptEvaluation.component';
import { VendorTransactionReportComponent } from './vender-transaction-report/Vendor-transaction-report.component';
import { ItemMgmtDetailComponent } from '../../inventory/reports/itm-mgmt-detail/itm-mgmt-detail.component';
import { SubstoreStockReportComponent } from './substore-stock/substore-stock.component';
import { INVPurchaseItemsSummeryReport } from './purchase-items-summary/inv-purchase-items-summary.component';
import { PurchaseSummaryComponent } from './purchase-summary/inv-purchase-summary.component';
import { SubstoreConsumptionAndDispatchComponent } from './substore-dispatch-consumption/substore-dispatch-consumption-report';
@NgModule({
  imports: [
    RouterModule.forChild([
      { path: '', component: InventoryReportsComponent },
      { path: 'StockLevel', component: StockLevelComponent },
      { path: 'DailyItemDispatch', component: DailyItemDispatchComponent },
      { path: 'PurchaseOrder', component: PurchaseOrderSummeryComponent },
      { path: 'InventorySummary', component: InventorySummaryComponent },
      { path: 'InventoryValuation', component: InventoryValuationComponent },
      { path: 'ComparisonPOGR', component: ComparisonPOGR },
      { path: 'PurchaseReports', component: PurchaseReport },
      { path: 'WriteOff', component: WriteOffComponent },
      { path: 'ReturnToVendor', component: ReturnToVendorComponent },
      { path: 'FixedAssets', component: FixedAssetsComponent },
      { path: 'CancelledPOandGR', component: CancelledPOandGR },
      { path: 'GoodReceiptEvaluation', component: GoodReceiptEvaluation },
      { path: 'VendorTransaction', component: VendorTransactionReportComponent },
      { path: 'ItemMgmtDetail', component: ItemMgmtDetailComponent },
      { path: 'SubstoreStock', component: SubstoreStockReportComponent },
      { path: 'PurchaseItems', component: INVPurchaseItemsSummeryReport },
      { path: 'PurchaseSummary', component: PurchaseSummaryComponent },
      { path: 'SubstoreDispatchNConsumption', component: SubstoreConsumptionAndDispatchComponent}
    ])
  ],
  exports: [
    RouterModule
  ]
})

export class InventoryReportsRoutingModule {

}
