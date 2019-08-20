import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";

import { InventoryReportsBLService } from './shared/inventory-reports.bl.service';
import { InventoryReportsDLService } from './shared/inventory-reports.dl.service';
import { InventoryReportsRoutingModule } from './inventory-reports-routing.module';
import { InventoryReportsComponent } from './inventory-reports.component';
import { StockLevelComponent } from './stock-level/stock-level.component';
import { DailyItemDispatchComponent } from './dispatch-level/daily-item-dispatch.component';
import { PurchaseOrderSummeryComponent } from './purchase-order-level/purchase-order-summery.component';
import { InventorySummaryComponent } from './inventory-summary/inventory-summary.component';
import { InventoryValuationComponent } from './inventory-valuation/inventory-valuation.component';
import { ComparisonPOGR } from './comparisonPO-GR/comparisonPO-GR.component';
import { PurchaseReport } from './purchase-report/purchase-report.component';
import { FixedAssetsComponent } from './fixed-assets/fixed-assets.component';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete/danphe-auto-complete.module';

import { SharedModule } from '../../shared/shared.module';
import { ReportingService } from '../../reporting/shared/reporting-service';
import { WriteOffComponent } from './write-off-report/write-off.component';
import { ReturnToVendorComponent } from './return-to-vendor/return-to-vendor-report.component';
@NgModule({
    providers: [InventoryReportsBLService, InventoryReportsDLService, ReportingService,
        { provide: LocationStrategy, useClass: HashLocationStrategy }],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        InventoryReportsRoutingModule,
        SharedModule,
        DanpheAutoCompleteModule],
    declarations: [
        InventoryReportsComponent,
        StockLevelComponent,
        DailyItemDispatchComponent,
        PurchaseOrderSummeryComponent,
        InventorySummaryComponent,
        InventoryValuationComponent,
        ComparisonPOGR,
        PurchaseReport,
        WriteOffComponent,
        ReturnToVendorComponent,
        FixedAssetsComponent
    ],

    bootstrap: [InventoryReportsComponent]
})
export class InventoryReportsModule { }
