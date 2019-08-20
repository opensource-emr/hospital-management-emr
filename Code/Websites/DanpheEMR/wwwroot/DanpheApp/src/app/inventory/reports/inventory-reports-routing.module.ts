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
            { path: 'FixedAssets', component: FixedAssetsComponent }
        ])
    ],
    exports: [
        RouterModule
    ]
})

export class InventoryReportsRoutingModule {

}
