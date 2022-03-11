import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";

import { VerificationRoutingModule } from "./verification-routing.module";
import { VerificationInventoryComponent } from "./inventory/verification-inventory.component";
import { VerificationMainComponent } from "./verification-main/verification-main.component";
import { VER_INV_RequisitionListComponent } from "./inventory/requisition-list/inventory-requisition-list.component";
import { VerificationService } from "./shared/verification.service";
import { VerificationBLService } from "./shared/verification.bl.service";
import { VerificationDLService } from "./shared/verification.dl.service";
import { SharedModule } from "../shared/shared.module";
import { VER_INV_RequisitionDetailsComponent } from './inventory/requisition-details/inventory-requisition-details.component';
import { InventoryDLService } from "../inventory/shared/inventory.dl.service";
import { InventoryBLService } from "../inventory/shared/inventory.bl.service";
import { InventoryService } from "../inventory/shared/inventory.service";
import { VER_INV_PurchaseRequestListComponent } from "./inventory/purchase-request/purchase-request-list.component";
import { VER_INV_PurchaseRequestDetailComponent } from "./inventory/purchase-request/purchase-request-detail.component";
import { PurchaseOrderListComponent } from './inventory/purchase-order/purchase-order-list.component';
import { PurchaseOrderVerifyComponent } from './inventory/purchase-order/purchase-order-verify.component';
import { GoodsReceiptListComponent } from './inventory/goods-receipt/goods-receipt-list.component';
import { GoodsReceiptVerifyComponent } from './inventory/goods-receipt/goods-receipt-verify.component';
import { ReactiveFormsModule } from "@angular/forms";

@NgModule({
  providers: [
    VerificationService,
    VerificationBLService,
    VerificationDLService,
    InventoryBLService,
    InventoryDLService,
    InventoryService
  ],
  declarations: [
    VerificationInventoryComponent,
    VerificationMainComponent,
    VER_INV_RequisitionListComponent,
    VER_INV_RequisitionDetailsComponent,
    VER_INV_PurchaseRequestListComponent,
    VER_INV_PurchaseRequestDetailComponent,
    PurchaseOrderListComponent,
    PurchaseOrderVerifyComponent,
    GoodsReceiptListComponent,
    GoodsReceiptVerifyComponent
  ],
  imports: [CommonModule, VerificationRoutingModule, SharedModule, ReactiveFormsModule]
})
export class VerificationModule {}
