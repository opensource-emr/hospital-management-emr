import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule} from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";

import { InventoryComponent } from "./inventory.component";
//import { ExternalMainComponent } from "./external/external-main.component";
import { InternalMainComponent } from "./internal/internal-main.component";
// import { PurchaseOrderItemsComponent } from "./external/purchase-order-items.component";
// import { PurchaseOrderListComponent } from "./external/purchase-order-list.component";
// import { PurchaseOrderDetailsComponent } from "./external/purchase-order-details.component";
// import { GoodsReceiptItemComponent } from "./external/goods-receipt-item.component";
// import { GoodsReceiptListComponent } from "./external/goods-receipt-list.component";
// import { GoodsReceiptDetailsComponent } from "./external/goods-receipt-details.component";
import { RequisitionItemsComponent } from "./internal/requisition-items.component";
import { DispatchItemsComponent } from "./internal/dispatch-items.component";
import { RequisitionListComponent } from "./internal/requisition-list.component";
import { ReturnToVendorItemsComponent } from "./procurement/return-to-vendor/return-to-vendor-items.component";
import { InventoryRoutingModule } from "./inventory-routing.module";
import { WriteOffItemsComponent } from "./internal/write-off-items.component";
import { RequisitionDetailsComponent } from "./internal/requisition-details.component";
import { StockListComponent } from "./stock/stock-list.component";
import { StockMainComponent } from "./stock/stock-main.component";
import { StockDetailsComponent } from "./stock/stock-details.component";
import { StockManageComponent } from "./stock/stock-manage.component";
import { DispatchAllComponent } from "./internal/dispatch-all.component";

import { InventoryBLService } from "./shared/inventory.bl.service";
import { InventoryDLService } from "./shared/inventory.dl.service";
import { InventoryService } from "./shared/inventory.service";
//import { Ng2AutoCompleteModule } from 'ng2-auto-complete';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { SharedModule } from "../shared/shared.module";
import { InventoryReportsModule } from './reports/inventory-reports.module';

import { InventoryDashboardComponent } from '../dashboards/inventory/inventory-dashboard.component';
import { InventorySharedModule } from './shared/inventory-shared.module';
//import { GoodsReceiptAddComponent } from './external/goods-receipt-add.component';
import { GoodReceiptService } from './shared/good-receipt/good-receipt.service';
import { GoodReceiptEndPoint } from './shared/good-receipt/good-receipt.endpoint';
import { CompanyService } from './settings/shared/company/company.service';
import { CompanyEndPoint } from './settings/shared/company/company.endpoint';
import { ReturnToVendorListComponent } from './procurement/return-to-vendor/return-to-vendor-list.component';
import { ReturnToVendorDetailsComponent } from './procurement/return-to-vendor/return-to-vendor-details.component';
import { EmailService } from './shared/email.service';
import { EmailEndPoint } from './shared/email.endpoint';
import { WriteOffItemsListComponent } from './internal/write-off-items-list.component';
import { ProcurementMainComponent } from './procurement/procurement-main.component';
import { PurchaseOrderItemsComponent } from './procurement/purchase-order-items.component';
import { PurchaseOrderListComponent } from './procurement/purchase-order-list.component';
import { PurchaseOrderDetailsComponent } from './procurement/purchase-order-details.component';
import { GoodsReceiptItemComponent } from './procurement/goods-receipt-item.component';
import { GoodsReceiptListComponent } from './procurement/goods-receipt-list.component';
import { GoodsReceiptDetailsComponent } from './procurement/goods-receipt-details.component';
import { GoodsReceiptAddComponent } from './procurement/goods-receipt-add.component';
import { RequestForQuotationComponent } from './procurement/request-for-quotation.component';
import { RequestForQuotationItemsComponent } from './procurement/request-for-quotation-items.component';
import { QuotationItemsComponent } from './procurement/quotation-items.component';
import { QuotationComponent } from './procurement/quotation.component';
//import { RequestForQuotationComponent } from './external/request-for-quotation.component';
//import { RequestForQuotationItemsComponent } from './external/request-for-quotation-items.component';
//import { VendorsManageComponent } from './settings/vendors/vendors-manage';
import { QuotationAnalysisComponent } from './procurement/quotation-analysis.component';
import { VendorsListComponent } from './procurement/vendorslist.component';

@NgModule({
    providers: [InventoryBLService, InventoryDLService, InventoryService,
        { provide: LocationStrategy, useClass: HashLocationStrategy },
        GoodReceiptService,
        GoodReceiptEndPoint,
        CompanyService,
        CompanyEndPoint,
        EmailService,
        EmailEndPoint
    ],
    imports: [
        CommonModule,
        ReactiveFormsModule,
        FormsModule,
        HttpClientModule,
        InventoryRoutingModule,
        SharedModule,
        //Ng2AutoCompleteModule,
        DanpheAutoCompleteModule,
        InventorySharedModule],
    //InventoryReportsModule],
    declarations: [InventoryComponent,
        ProcurementMainComponent,
        InternalMainComponent,
        PurchaseOrderItemsComponent,
        PurchaseOrderListComponent,
        PurchaseOrderDetailsComponent,
        GoodsReceiptItemComponent,
        GoodsReceiptListComponent,
        GoodsReceiptDetailsComponent,
        RequisitionItemsComponent,
        DispatchItemsComponent,
        RequisitionListComponent,
        RequisitionItemsComponent,
        RequisitionDetailsComponent,
        InventoryDashboardComponent,
        ReturnToVendorItemsComponent,
        WriteOffItemsComponent,
        RequisitionDetailsComponent,
        StockListComponent,
        StockMainComponent,
        StockDetailsComponent,
        StockManageComponent,
        DispatchAllComponent,
        GoodsReceiptAddComponent,
        ReturnToVendorListComponent,
        ReturnToVendorDetailsComponent,
        WriteOffItemsListComponent,
        RequestForQuotationComponent,
        RequestForQuotationItemsComponent,
        QuotationComponent,
        QuotationItemsComponent,
        VendorsListComponent,
        QuotationAnalysisComponent
        //VendorsManageComponent
        
    ],
    bootstrap: [InventoryComponent]
})
export class InventoryModule { }
