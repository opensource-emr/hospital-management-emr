import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { WardSupplyMainComponent } from './wardsupply-main.component';
import { RequisitionComponent } from './requisition.component';
import { StockComponent } from './stock.component';
import { ConsumptionComponent } from './consumption.component';
import { ConsumptionListComponent } from './consumption-list.component';
import { PharmacyTransferComponent } from './pharmacy-transfer.component';
import { WardReportComponent } from './reports/reports.component';
import { WardStockReportComponent } from './reports/stock-report.component';
import { WardRequisitionReportComponent } from './reports/requisition-report.component';
import { WardDispatchReportComponent } from './reports/dispatch-report.component';
import { WardConsumptionReportComponent } from './reports/consumption-report.component';
import { WardBreakageReportComponent } from './reports/breakage-report.component';
import { WardTransferReportComponent } from './reports/transfer-report.component';
import { AuthGuardService } from '../security/shared/auth-guard.service';
import { WardPharmacyStockComponent } from './wardsupply-pharmacy-stock.component';
import { WardInventoryStockComponent } from './inventory-wardsupply/stock/inventory-ward-stock.component';
import { PharmacyWardComponent } from './pharmacy-ward.component';
import { InventoryWardComponent } from './inventory-wardsupply/inventory-ward.component';
import { InventoryWardRequisitionItemComponent } from './inventory-wardsupply/requisition/inventory-ward-requisition-item.component';
import { InventoryRequisitionListComponent } from './inventory-wardsupply/requisition/inventory-ward-requisition-list.component';
import { InventoryRequisitionDetailsComponent } from './inventory-wardsupply/requisition/inventory-ward-requisition-details.component';
import { InventoryConsumptionListComponent } from './inventory-wardsupply/consumption/inventory-ward-consumption-list.component';
import { InventoryConsumptionComponent } from './inventory-wardsupply/consumption/inventory-ward-consumption.component';
import { WardInventoryReportComponent } from './inventory-wardsupply/reports/ward-inventory-reports.component';
import { RequisitionDispatchReportComponent } from './inventory-wardsupply/reports/requisition-dispatch-report.component';
import { TransferReportComponent } from './inventory-wardsupply/reports/transfer-report.component';
import { ConsumptionReportComponent } from './inventory-wardsupply/reports/consumption-report.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',//this is : '/Inventory'
        component: WardSupplyMainComponent, canActivate: [AuthGuardService],
        children: [

          { path: '', redirectTo: 'Pharmacy', pathMatch: 'full' },
          {
            path: 'Pharmacy', component: PharmacyWardComponent, canActivate: [AuthGuardService],
            children: [
              { path: '', redirectTo: 'Requisition', pathMatch: 'full' },
              { path: 'Requisition', component: RequisitionComponent },
              { path: 'Stock', component: WardPharmacyStockComponent },
              { path: 'Consumption', component: ConsumptionListComponent },
              { path: 'ConsumptionItem', component: ConsumptionComponent },
              { path: 'PharmacyTransfer', component: PharmacyTransferComponent },
              { path: 'Reports', component: WardReportComponent },
              { path: 'Reports/StockReport', component: WardStockReportComponent },
              { path: 'Reports/RequisitionReport', component: WardRequisitionReportComponent },
              { path: 'Reports/DispatchReport', component: WardDispatchReportComponent },
              { path: 'Reports/ConsumptionReport', component: WardConsumptionReportComponent },
              { path: 'Reports/BreakageReport', component: WardBreakageReportComponent },
              { path: 'Reports/TransferReport', component: WardTransferReportComponent },
            ]
          },
          {
            path: 'Inventory', component: InventoryWardComponent, canActivate: [AuthGuardService],
            children: [
              { path: '', redirectTo: 'InventoryRequisitionList', pathMatch: 'full' },
              { path: 'InventoryRequisitionList', component: InventoryRequisitionListComponent },
              { path: 'InventoryRequisitionItem', component: InventoryWardRequisitionItemComponent },
              { path: 'InventoryRequisitionDetails', component: InventoryRequisitionDetailsComponent },
              { path: 'Stock', component: WardInventoryStockComponent },
              { path: 'Consumption', component: InventoryConsumptionListComponent },
              { path: 'ConsumptionItem', component: InventoryConsumptionComponent },
              { path: 'Reports', component: WardInventoryReportComponent },
              { path: 'Reports/RequisitionDispatchReport', component: RequisitionDispatchReportComponent },
              { path: 'Reports/TransferReport', component: TransferReportComponent },
              { path: 'Reports/ConsumptionReport', component: ConsumptionReportComponent },
              // { path: 'PharmacyTransfer', component: PharmacyTransferComponent },
              // { path: 'Reports', component: WardReportComponent },
              // { path: 'Reports/StockReport', component: WardStockReportComponent },
              // { path: 'Reports/RequisitionReport', component: WardRequisitionReportComponent },
              // { path: 'Reports/DispatchReport', component: WardDispatchReportComponent },
              // { path: 'Reports/ConsumptionReport', component: WardConsumptionReportComponent },
              // { path: 'Reports/BreakageReport', component: WardBreakageReportComponent },
              // { path: 'Reports/TransferReport', component: WardTransferReportComponent },
            ]
          },
        ]
      }
    ])
  ],
  exports: [
    RouterModule
  ]
})

export class WardSupplyRoutingModule {

}
