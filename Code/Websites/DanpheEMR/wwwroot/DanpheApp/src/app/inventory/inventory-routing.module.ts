import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";

import { InventoryComponent } from "./inventory.component";
import { InternalMainComponent } from "./internal/internal-main.component";
import { DirectDispatchComponent } from "./internal/direct-dispatch.component";
import { DispatchItemsComponent } from "./internal/dispatch-items.component"
import { RequisitionListComponent } from "./internal/requisition-list.component";
import { WriteOffItemsComponent } from "./internal/write-off-items.component"
import { RequisitionDetailsComponent } from "./internal/requisition-details.component"
import { StockMainComponent } from "./stock/stock-main.component";
import { StockListComponent } from "./stock/stock-list.component";
import { StockDetailsComponent } from "./stock/stock-details.component";
import { StockManageComponent } from "./stock/stock-manage.component";
import { InventoryDashboardComponent } from '../dashboards/inventory/inventory-dashboard.component';
import { WriteOffItemsListComponent } from './internal/write-off-items-list.component';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { DispatchReceiptDetailsComponent } from './internal/dispatch-receipt-details.components';
import { InternalMainPurchaseRequestAddComponent } from './internal/purchase-request/internalmain-purchase-request-add.component';
import { PageNotFound } from '../404-error/404-not-found.component';
import { InternalmainPurhcaseRequestListComponent } from './internal/purchase-request/internalmain-purhcase-request-list.component';
import { InternalmainPurchaseRequestDetailComponent } from './internal/purchase-request/internalmain-purchase-request-detail.component';
import { GoodsReceiptStockListComponent } from './stock/goods-receipt-stock-list.component';
import { GoodsReceiptInvViewComponent } from './stock/goods-receipt-inv-view.component';
import { ReturnToVendorListComponent } from './return-to-vendor/return-to-vendor-list/return-to-vendor-list.component';
import { ReturnToVendorAddComponent } from './return-to-vendor/return-to-vendor-add/return-to-vendor-add.component';
import { ReturnToVendorViewComponent } from './return-to-vendor/return-to-vendor-view/return-to-vendor-view.component';
import { ActivateInventoryGuardService } from '../shared/activate-inventory/activate-inventory-guard.service';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',//this is : '/Inventory' 
        component: InventoryComponent, canActivate: [AuthGuardService, ActivateInventoryGuardService],
        children: [

          { path: '', redirectTo: 'Dashboard', pathMatch: 'full' },
          { path: 'Dashboard', component: InventoryDashboardComponent, canActivate: [AuthGuardService] },
          {
            path: 'InternalMain',
            component: InternalMainComponent, canActivate: [AuthGuardService],
            children: [
              { path: '', redirectTo: 'Requisition', pathMatch: 'full' },
              {
                path: 'Requisition',
                children: [
                  { path: 'RequisitionList', component: RequisitionListComponent },
                  { path: 'RequisitionDetails', component: RequisitionDetailsComponent },
                  { path: 'DirectDispatch', component: DirectDispatchComponent },
                  { path: 'Dispatch', component: DispatchItemsComponent },
                  { path: 'DispatchReceiptDetails', component: DispatchReceiptDetailsComponent },
                  { path: '', redirectTo: 'RequisitionList', pathMatch: 'full' },
                  { path: "**", component: PageNotFound }
                ]
              },
              { path: 'WriteOffItems', component: WriteOffItemsComponent },
              { path: 'WriteOffItemsList', component: WriteOffItemsListComponent },
              // { path: 'ReturnToVendorDetails', component: ReturnToVendorDetailsComponent },
              {
                path: 'PurchaseRequest',
                children: [
                  { path: 'PurchaseRequestList', component: InternalmainPurhcaseRequestListComponent },
                  { path: 'PurchaseRequestAdd', component: InternalMainPurchaseRequestAddComponent },
                  { path: 'PurchaseRequestDetail', component: InternalmainPurchaseRequestDetailComponent },
                  { path: '', redirectTo: 'PurchaseRequestList', pathMatch: 'full' },
                  { path: "**", component: PageNotFound }
                ]
              },
              { path: "**", component: PageNotFound }

            ]
          },
          {
            path: 'ReturnToVendor', children: [
              { path: 'ReturnToVendorList', component: ReturnToVendorListComponent },
              { path: 'ReturnToVendorAdd', component: ReturnToVendorAddComponent },
              { path: 'ReturnToVendorView', component: ReturnToVendorViewComponent },
              { path: '', redirectTo: 'ReturnToVendorList', pathMatch: 'full' },
              { path: "**", component: PageNotFound }

            ]
          },
          {
            path: 'StockMain', component: StockMainComponent, canActivate: [AuthGuardService],
            children: [
              { path: '', redirectTo: 'StockList', pathMatch: 'full' },
              { path: 'StockList', component: StockListComponent, canActivate: [AuthGuardService] },
              { path: 'StockDetails', component: StockDetailsComponent, canActivate: [AuthGuardService] },
              { path: 'StockManage', component: StockManageComponent, canActivate: [AuthGuardService] },
              { path: 'GoodsReceiptStockList', component: GoodsReceiptStockListComponent, canActivate: [AuthGuardService] },
              { path: 'GoodsReceiptStockDetails', component: GoodsReceiptInvViewComponent },

              { path: "**", component: PageNotFound }

            ]
          },
          { path: 'Reports', loadChildren: './reports/inventory-reports.module#InventoryReportsModule', canActivate: [AuthGuardService] },
          { path: 'Settings', loadChildren: './settings/inventory-settings.module#InventorySettingsModule' },
          { path: "**", component: PageNotFound }

        ]
      },
      { path: "**", component: PageNotFound }
    ])
  ],
  exports: [
    RouterModule
  ]
})

export class InventoryRoutingModule {

}
