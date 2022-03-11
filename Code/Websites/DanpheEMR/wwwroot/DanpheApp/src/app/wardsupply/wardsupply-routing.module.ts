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
import { InternalConsumptionComponent } from './internal-consumption.component';
import { InternalConsumptionListComponent } from './internal-consumption-list.component';
import { InternalConsumptionDetailsComponent } from './internal-consumption-details.component';
import { WardInternalConsumptionReportComponent } from './reports/internal-consumption-report.component';
import { InventoryWardReceiveStockComponent } from './inventory-wardsupply/requisition/inventory-ward-receive-stock/inventory-ward-receive-stock.component';
import { PageNotFound } from '../404-error/404-not-found.component';
import { WardSupplyAssetStockComponent } from './wardsupply-asset/wardsupply-asset-stock/wardsupply-asset-stock.component';
import { WardSupplyAssetReturnListComponent } from './wardsupply-asset/wardsupply-asset-return/wardsupply-asset-return-list.component';
import { WardSupplyAssetRequisitionListComponent } from './wardsupply-asset/wardsupply-asset-requisition/wardsupply-asset-requisition-list.component';
import { WardSupplyAssetMainComponent } from './wardsupply-asset/wardsupply-asset-main.component';
import { WardSupplyAssetReturnComponent } from './wardsupply-asset/wardsupply-asset-return/wardsupply-asset-new-return.component';
import { InventoryPatientConsumptionListComponent } from './inventory-wardsupply/patient-consumption/inventory-ward-patient-consumption-list.component';
import { InventoryPatientConsumptionComponent } from './inventory-wardsupply/patient-consumption/inventory-ward-patient-consumption.component';
import { WardSupplyAssetRequisitionDetailsComponent } from './wardsupply-asset/wardsupply-asset-requisition/wardsupply-asset-requisition-details.component';
import { WardSupplyAssetReqDispatchComponent } from './wardsupply-asset/wardsupply-asset-requisition/wardsupply-asset-req-dispatch/wardsupply-asset-req-dispatch-list.component';

@NgModule({
  imports: [
    RouterModule.forChild([
      {
        path: '',//this is : '/Inventory'
        component: WardSupplyMainComponent, canActivate: [AuthGuardService],
        children: [
          {
            path: 'Pharmacy', component: PharmacyWardComponent, canActivate: [AuthGuardService],
            children: [
              { path: '', redirectTo: 'Stock', pathMatch: 'full' },
              { path: 'Requisition', component: RequisitionComponent },
              { path: 'Stock', component: WardPharmacyStockComponent },
              { path: 'Consumption', component: ConsumptionListComponent },
              { path: 'ConsumptionItem', component: ConsumptionComponent },
              //{ path: 'ConsumptionDetails', component: ConsumptionDetailsComponent },
              { path: 'InternalConsumption', component: InternalConsumptionComponent },
              { path: 'InternalConsumptionList', component: InternalConsumptionListComponent },
              { path: 'InternalConsumptionDetails', component: InternalConsumptionDetailsComponent },
              { path: 'PharmacyTransfer', component: PharmacyTransferComponent },
              { path: 'Reports', component: WardReportComponent },
              { path: 'Reports/StockReport', component: WardStockReportComponent },
              { path: 'Reports/RequisitionReport', component: WardRequisitionReportComponent },
              { path: 'Reports/DispatchReport', component: WardDispatchReportComponent },
              { path: 'Reports/ConsumptionReport', component: WardConsumptionReportComponent },
              { path: 'Reports/InternalConsumptionReport', component: WardInternalConsumptionReportComponent },
              { path: 'Reports/BreakageReport', component: WardBreakageReportComponent },
              { path: 'Reports/TransferReport', component: WardTransferReportComponent },
              { path: "**", component: PageNotFound }

            ]
          },
          {
            path: 'Inventory', component: InventoryWardComponent, canActivate: [AuthGuardService],
            children: [
              { path: '', redirectTo: 'Stock', pathMatch: 'full' },
              { path: 'InventoryRequisitionList', component: InventoryRequisitionListComponent },
              { path: 'InventoryRequisitionItem', component: InventoryWardRequisitionItemComponent },
              { path: 'InventoryRequisitionDetails', component: InventoryRequisitionDetailsComponent },
              { path: 'ReceiveStock', component: InventoryWardReceiveStockComponent },
              { path: 'Stock', component: WardInventoryStockComponent },
              {
                path: 'Consumption', children: [
                  { path: 'ConsumptionList', component: InventoryConsumptionListComponent },
                  { path: 'ConsumptionAdd', component: InventoryConsumptionComponent },
                  { path: '', redirectTo: 'ConsumptionList', pathMatch: 'full' },
                  { path: "**", component: PageNotFound }
                ]
              },
              {
                path: 'PatientConsumption', children: [
                  { path: 'PatientConsumptionList', component: InventoryPatientConsumptionListComponent },
                  { path: 'PatientConsumptionAdd', component: InventoryPatientConsumptionComponent },
                  { path: '', redirectTo: 'PatientConsumptionList', pathMatch: 'full' },
                  { path: "**", component: PageNotFound }
                ]
              },
              { path: 'Reports', component: WardInventoryReportComponent },
              { path: 'Reports/RequisitionDispatchReport', component: RequisitionDispatchReportComponent },
              { path: 'Reports/TransferReport', component: TransferReportComponent },
              { path: 'Reports/ConsumptionReport', component: ConsumptionReportComponent },
              { path: "**", component: PageNotFound }


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
          {
            path: 'FixedAsset', component: WardSupplyAssetMainComponent,
            children: [
              { path: '', redirectTo: 'Stock', pathMatch: 'full' },
              {
                path: 'Requisition',
                children: [
                  { path: '', redirectTo: 'List', pathMatch: 'full' },
                  { path: 'List', component: WardSupplyAssetRequisitionListComponent },
                  { path: 'View', component: WardSupplyAssetRequisitionDetailsComponent } ]},
              { path: 'Stock', component: WardSupplyAssetStockComponent },
              { path: 'Return', component: WardSupplyAssetReturnListComponent },
              { path: 'RequisitionDispatch', component: WardSupplyAssetReqDispatchComponent }              
        ],
          },
        ]
      },
      { path: "**", component: PageNotFound }

    ])
  ],
  exports: [
    RouterModule
  ]
})

export class WardSupplyRoutingModule {

}
