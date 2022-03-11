import { NgModule } from '@angular/core';
import { RouterModule } from "@angular/router";
import { PageNotFound } from '../404-error/404-not-found.component';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { ProcurementComponent } from './procurement-main/procurement.component';
import { GoodsReceiptAddComponent } from './goods-receipt/goods-receipt-add/goods-receipt-add.component';
import { GoodsReceiptListComponent } from './goods-receipt/goods-receipt-list/goods-receipt-list.component';
import { GoodsReceiptViewComponent } from './goods-receipt/goods-receipt-view/goods-receipt-view.component';
import { PurchaseOrderAddComponent } from './purchase-order/purchase-order-add/purchase-order-add.component';
import { PurchaseOrderListComponent } from './purchase-order/purchase-order-list/purchase-order-list.component';
import { PurchaseOrderViewComponent } from './purchase-order/purchase-order-view/purchase-order-view.component';
import { PurchaseRequestViewComponent } from './purchase-request/purchase-request-view/purchase-request-view.component';
import { PurchaseRequestListComponent } from './purchase-request/purchase-request-list/purchase-request-list.component';
import { QuotationAnalysisComponent } from './quotation/quotation-analysis/quotation-analysis.component';
import { QuotationAddComponent } from './quotation/quotation-add/quotation-add.component';
import { QuotationListComponent } from './quotation/quotation-list/quotation-list.component';
import { RequestForQuotationAddComponent } from './quotation/request-for-quotation-add/request-for-quotation-add.component';
import { RequestForQuotationListComponent } from './quotation/request-for-quotation-list/request-for-quotation-list.component';
import { VendorListComponent } from './vendor-list/vendor-list.component';
import { ActivateInventoryGuardService } from '../shared/activate-inventory/activate-inventory-guard.service';
@NgModule({
    imports: [
        RouterModule.forChild([
            {
                path: '',//this is : '/ProcurementMain'
                component: ProcurementComponent, canActivate: [AuthGuardService, ActivateInventoryGuardService],
                children: [
                    { path: '', redirectTo: 'PurchaseRequest', pathMatch: 'full' },
                    {
                        path: 'PurchaseRequest', children: [
                            { path: 'PurchaseRequestList', component: PurchaseRequestListComponent },
                            { path: 'PurchaseRequestView', component: PurchaseRequestViewComponent },
                            { path: '', redirectTo: 'PurchaseRequestList', pathMatch: 'full' },
                            { path: "**", component: PageNotFound }

                        ]
                    },
                    {
                        path: 'PurchaseOrder', children: [
                            { path: 'PurchaseOrderAdd', component: PurchaseOrderAddComponent, canActivate: [AuthGuardService] },
                            { path: 'PurchaseOrderList', component: PurchaseOrderListComponent },
                            { path: 'PurchaseOrderView', component: PurchaseOrderViewComponent },
                            { path: '', redirectTo: 'PurchaseOrderList', pathMatch: 'full' },
                            { path: "**", component: PageNotFound }

                        ]
                    },
                    {
                        path: 'GoodsReceipt', children: [
                            { path: 'GoodsReceiptAdd', component: GoodsReceiptAddComponent, canActivate: [AuthGuardService] },
                            { path: 'GoodsReceiptList', component: GoodsReceiptListComponent, canActivate: [AuthGuardService] },
                            { path: 'GoodsReceiptView', component: GoodsReceiptViewComponent, canActivate: [AuthGuardService] },
                            { path: '', redirectTo: 'GoodsReceiptList', pathMatch: 'full' },
                            { path: "**", component: PageNotFound }

                        ]
                    },
                    {
                        path: 'Quotation', children: [
                            { path: 'RequestForQuotationList', component: RequestForQuotationListComponent },
                            { path: 'RequestForQuotationAdd', component: RequestForQuotationAddComponent },
                            { path: 'QuotationList', component: QuotationListComponent },
                            { path: 'QuotationAdd', component: QuotationAddComponent },
                            { path: 'QuotationAnalysis', component: QuotationAnalysisComponent },
                            { path: '', redirectTo: 'RequestForQuotationList', pathMatch: 'full' },
                            { path: "**", component: PageNotFound }

                        ]
                    },

                    { path: 'VendorList', component: VendorListComponent },
                    { path: 'Reports', loadChildren: '../inventory/reports/inventory-reports.module#InventoryReportsModule' },
                    { path: 'Settings', loadChildren: '../inventory/settings/inventory-settings.module#InventorySettingsModule' },
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

export class ProcurementRoutingModule {

}
