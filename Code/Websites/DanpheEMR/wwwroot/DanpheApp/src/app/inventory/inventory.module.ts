import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";
import { InventoryComponent } from "./inventory.component";
import { InternalMainComponent } from "./internal/internal-main.component";
import { DirectDispatchComponent } from "./internal/direct-dispatch.component";
import { DispatchItemsComponent } from "./internal/dispatch-items.component";
import { RequisitionListComponent } from "./internal/requisition-list.component";
import { InventoryRoutingModule } from "./inventory-routing.module";
import { WriteOffItemsComponent } from "./internal/write-off-items.component";
import { RequisitionDetailsComponent } from "./internal/requisition-details.component";
import { StockListComponent } from "./stock/stock-list.component";
import { StockMainComponent } from "./stock/stock-main.component";
import { StockDetailsComponent } from "./stock/stock-details.component";
import { StockManageComponent } from "./stock/stock-manage.component";
import { InventoryBLService } from "./shared/inventory.bl.service";
import { InventoryDLService } from "./shared/inventory.dl.service";
import { InventoryService } from "./shared/inventory.service";
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module';
import { SharedModule } from "../shared/shared.module";
import { InventoryDashboardComponent } from '../dashboards/inventory/inventory-dashboard.component';
import { InventorySharedModule } from './shared/inventory-shared.module';
import { GoodReceiptService } from './shared/good-receipt/good-receipt.service';
import { GoodReceiptEndPoint } from './shared/good-receipt/good-receipt.endpoint';
import { CompanyService } from './settings/shared/company/company.service';
import { CompanyEndPoint } from './settings/shared/company/company.endpoint';
import { EmailService } from './shared/email.service';
import { EmailEndPoint } from './shared/email.endpoint';
import { WriteOffItemsListComponent } from './internal/write-off-items-list.component';
import { DispatchReceiptDetailsComponent } from './internal/dispatch-receipt-details.components';
import { InternalMainPurchaseRequestAddComponent } from './internal/purchase-request/internalmain-purchase-request-add.component';
import { MappingAddComponent } from './settings/Mapping/mapping-add.component'
import { WardSupplyBLService } from '../wardsupply/shared/wardsupply.bl.service';
import { WardSupplyDLService } from '../wardsupply/shared/wardsupply.dl.service';
import { PharmacyBLService } from '../pharmacy/shared/pharmacy.bl.service';
import { PharmacyDLService } from '../pharmacy/shared/pharmacy.dl.service';
import { VisitDLService } from '../appointments/shared/visit.dl.service';
import { ADT_BLService } from '../adt/shared/adt.bl.service';
import { AppointmentDLService } from '../appointments/shared/appointment.dl.service';
import { BillingBLService } from '../billing/shared/billing.bl.service';
import { ADT_DLService } from '../adt/shared/adt.dl.service';
import { InternalmainPurhcaseRequestListComponent } from './internal/purchase-request/internalmain-purhcase-request-list.component';
import { InternalmainPurchaseRequestDetailComponent } from './internal/purchase-request/internalmain-purchase-request-detail.component';
import { GoodsReceiptStockListComponent } from './stock/goods-receipt-stock-list.component';
import { GoodsReceiptInvViewComponent } from './stock/goods-receipt-inv-view.component';
import { ReturnToVendorListComponent } from './return-to-vendor/return-to-vendor-list/return-to-vendor-list.component';
import { ReturnToVendorAddComponent } from './return-to-vendor/return-to-vendor-add/return-to-vendor-add.component';
import { ReturnToVendorViewComponent } from './return-to-vendor/return-to-vendor-view/return-to-vendor-view.component';
import { GoodsReceiptInvNpViewComponent } from './stock/goods-receipt-inv-np-view/goods-receipt-inv-np-view.component';

@NgModule({
  providers: [InventoryBLService, InventoryDLService, InventoryService, WardSupplyBLService,
    WardSupplyDLService,
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    GoodReceiptService,
    GoodReceiptEndPoint,
    CompanyService,
    CompanyEndPoint,
    EmailService,
    EmailEndPoint,
    PharmacyBLService,
    PharmacyDLService,
    VisitDLService,
    ADT_BLService,
    AppointmentDLService,
    BillingBLService,
    ADT_DLService,
  ],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    HttpClientModule,
    InventoryRoutingModule,
    SharedModule,
    DanpheAutoCompleteModule,
    InventorySharedModule],
  declarations: [
    InventoryComponent,
    InternalMainComponent,
    DirectDispatchComponent,
    DispatchItemsComponent,
    RequisitionListComponent,
    DirectDispatchComponent,
    RequisitionDetailsComponent,
    InventoryDashboardComponent,
    WriteOffItemsComponent,
    RequisitionDetailsComponent,
    StockListComponent,
    StockMainComponent,
    StockDetailsComponent,
    StockManageComponent,
    WriteOffItemsListComponent,
    DispatchReceiptDetailsComponent,
    MappingAddComponent,
    InternalmainPurhcaseRequestListComponent,
    InternalmainPurchaseRequestDetailComponent,
    InternalMainPurchaseRequestAddComponent,
    GoodsReceiptStockListComponent,
    GoodsReceiptInvViewComponent,
    ReturnToVendorListComponent,
    ReturnToVendorAddComponent,
    ReturnToVendorViewComponent,
    GoodsReceiptInvNpViewComponent
  ],
  bootstrap: [InventoryComponent]
})
export class InventoryModule { }
