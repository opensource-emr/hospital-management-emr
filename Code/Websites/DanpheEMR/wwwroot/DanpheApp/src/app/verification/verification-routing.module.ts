import { NgModule } from "@angular/core";
import { Routes, RouterModule } from "@angular/router";
import { VerificationInventoryComponent } from "./inventory/verification-inventory.component";
import { VerificationMainComponent } from "./verification-main/verification-main.component";
import { AuthGuardService } from "../security/shared/auth-guard.service";
import { VER_INV_RequisitionListComponent } from "./inventory/requisition-list/inventory-requisition-list.component";
import { VER_INV_RequisitionDetailsComponent } from "./inventory/requisition-details/inventory-requisition-details.component";
import { VER_INV_PurchaseRequestListComponent } from "./inventory/purchase-request/purchase-request-list.component";
import { VER_INV_PurchaseRequestDetailComponent } from "./inventory/purchase-request/purchase-request-detail.component";
import { PageNotFound } from "../404-error/404-not-found.component";
import { PurchaseOrderListComponent } from "./inventory/purchase-order/purchase-order-list.component";
import { PurchaseOrderVerifyComponent } from "./inventory/purchase-order/purchase-order-verify.component";
import { GoodsReceiptListComponent } from "./inventory/goods-receipt/goods-receipt-list.component";
import { GoodsReceiptVerifyComponent } from "./inventory/goods-receipt/goods-receipt-verify.component";

const routes: Routes = [
  {
    path: "", component: VerificationMainComponent, canActivate: [AuthGuardService],
    children: [
      {
        path: "Inventory", component: VerificationInventoryComponent,
        children: [
          {
            path: "Requisition",
            children: [
              { path: "", component: VER_INV_RequisitionListComponent },
              { path: "RequisitionDetails", component: VER_INV_RequisitionDetailsComponent },
              { path: "**", component: PageNotFound }
            ]
          }, {
            path: "PurchaseRequest",
            children: [
              { path: "", component: VER_INV_PurchaseRequestListComponent },
              { path: "PurchaseRequestDetail", component: VER_INV_PurchaseRequestDetailComponent },
              { path: "**", component: PageNotFound }
            ]
          }, {
            path: "PurchaseOrder",
            children: [
              { path: "", component: PurchaseOrderListComponent },
              { path: "PurchaseOrderVerify", component: PurchaseOrderVerifyComponent },
              { path: "**", component: PageNotFound }
            ]
          }, {
            path: "GoodsReceipt",
            children: [
              { path: "", component: GoodsReceiptListComponent },
              { path: "GoodsReceiptVerify", component: GoodsReceiptVerifyComponent },
              { path: "**", component: PageNotFound }
            ]
          }
        ]
      },
      { path: "", redirectTo: "/Verification/Inventory", pathMatch: "full" },
      { path: "**", component: PageNotFound }
    ]
  },
  { path: "**", component: PageNotFound }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class VerificationRoutingModule { }
