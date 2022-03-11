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
import { StockLevelComponent } from './inv-stock-report-main/stock-level/stock-level.component';
import { DailyItemDispatchComponent } from './dispatch-level/daily-item-dispatch.component';
import { PurchaseOrderSummaryComponent } from './purchase-order-level/purchase-order-summary.component';
import { InventorySummaryComponent } from './inventory-summary/inventory-summary.component';
import { InventoryValuationComponent } from './inventory-valuation/inventory-valuation.component';
import { ComparisonPOGR } from './inv-purchase-report-main/comparisonPO-GR/comparisonPO-GR.component';
import { PurchaseReport } from './inv-purchase-report-main/purchase-report/purchase-report.component';
import { FixedAssetsComponent } from './fixed-assets/fixed-assets.component';
import { DanpheAutoCompleteModule } from '../../shared/danphe-autocomplete/danphe-auto-complete.module';
import { CancelledPOandGR } from './inv-purchase-report-main/cancelledPO-GR/cancelledPOandGR.component';
import { SharedModule } from '../../shared/shared.module';
import { ReportingService } from '../../reporting/shared/reporting-service';
import { WriteOffComponent } from './write-off-report/write-off.component';
import { ReturnToVendorComponent } from './return-to-vendor/return-to-vendor-report.component';
import { GoodReceiptEvaluation } from './goodreceipt-evaluation/GoodReceiptEvaluation.component';
import { VendorTransactionReportComponent } from './vender-transaction-report/Vendor-transaction-report.component';
import { ItemMgmtDetailComponent } from '../../inventory/reports/itm-mgmt-detail/itm-mgmt-detail.component';
import { SubstoreStockReportComponent } from './inv-stock-report-main/substore-stock/substore-stock.component';
import { INVPurchaseItemsSummeryReport } from './purchase-items-summary/inv-purchase-items-summary.component';
import { POViewComponent } from "../reports/po-view/po-view.component"
import { GRViewComponent } from "../reports/gr-view/gr-view.component"
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
import {INVSupplierInfoReportComponent} from './inv-supplier-report-main/Supplier-Information/supplier-information-report.component'
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
    PurchaseOrderSummaryComponent,
    InventorySummaryComponent,
    InventoryValuationComponent,
    ComparisonPOGR,
    PurchaseReport,
    WriteOffComponent,
    ReturnToVendorComponent,
    FixedAssetsComponent,
    CancelledPOandGR,
    GoodReceiptEvaluation,
    VendorTransactionReportComponent,
    ItemMgmtDetailComponent,
    SubstoreStockReportComponent,
    INVPurchaseItemsSummeryReport,
    POViewComponent,
    GRViewComponent,
    PurchaseSummaryComponent,
    ApprovedMaterialStockRegisterComponent,
    InventoryValueByItemCategoryComponent,
    DetailStockLedgerComponent,
    InvPurchaseReportMainComponent,
    InvStockReportMainComponent,
    InvSupplierReportMainComponent,
    SupplierWiseStockReportComponent,
    ReturnToSupplierComponent,
    ExpiryItemComponent,
    INVSupplierInfoReportComponent

  ],

  bootstrap: [InventoryReportsComponent],
})
export class InventoryReportsModule { }
