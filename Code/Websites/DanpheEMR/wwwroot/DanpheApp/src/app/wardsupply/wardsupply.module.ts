import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { HashLocationStrategy, LocationStrategy } from "@angular/common";

import { SharedModule } from '../shared/shared.module';
import { WardSupplyDLService } from './shared/wardsupply.dl.service';
import { WardSupplyBLService } from './shared/wardsupply.bl.service';
import { WardSupplyRoutingModule } from './wardsupply-routing.module';

import { WardSupplyMainComponent } from './wardsupply-main.component';
import { ConsumptionComponent } from './consumption.component';
import { StockComponent } from './stock.component';
import { RequisitionComponent } from './requisition.component';
import { PharmacyBLService } from "../pharmacy/shared/pharmacy.bl.service"
import { PharmacyDLService } from "../pharmacy/shared/pharmacy.dl.service"
import { PharmacyService } from '../pharmacy/shared/pharmacy.service';
import { DanpheAutoCompleteModule } from '../shared/danphe-autocomplete/danphe-auto-complete.module'
import { ConsumptionListComponent } from './consumption-list.component';
import { PharmacyTransferComponent } from './pharmacy-transfer.component';
import { WardReportComponent } from './reports/reports.component';
import { WardStockReportComponent } from './reports/stock-report.component';
import { WardRequisitionReportComponent } from './reports/requisition-report.component';
import { WardDispatchReportComponent } from './reports/dispatch-report.component';
import { WardConsumptionReportComponent } from './reports/consumption-report.component';
import { WardBreakageReportComponent } from './reports/breakage-report.component';
import { WardTransferReportComponent } from './reports/transfer-report.component';
import { PharmacyWardComponent } from './pharmacy-ward.component';
import { InventoryWardRequisitionItemComponent } from './inventory-wardsupply/requisition/inventory-ward-requisition-item.component';
import { InventoryWardComponent } from './inventory-wardsupply/inventory-ward.component';
import { InventoryRequisitionListComponent } from './inventory-wardsupply/requisition/inventory-ward-requisition-list.component';
import { InventoryBLService } from '../inventory/shared/inventory.bl.service';
import { InventoryService } from '../inventory/shared/inventory.service';
import { InventoryDLService } from '../inventory/shared/inventory.dl.service';
import { InventoryRequisitionDetailsComponent } from './inventory-wardsupply/requisition/inventory-ward-requisition-details.component';
import { WardPharmacyStockComponent } from './wardsupply-pharmacy-stock.component';
import { WardInventoryStockComponent } from './inventory-wardsupply/stock/inventory-ward-stock.component';
import { InventoryConsumptionComponent } from './inventory-wardsupply/consumption/inventory-ward-consumption.component';
import { InventoryConsumptionListComponent } from './inventory-wardsupply/consumption/inventory-ward-consumption-list.component';
import { WardInventoryReportComponent } from './inventory-wardsupply/reports/ward-inventory-reports.component';
import { RequisitionDispatchReportComponent } from './inventory-wardsupply/reports/requisition-dispatch-report.component';
import { TransferReportComponent } from './inventory-wardsupply/reports/transfer-report.component';
import { ConsumptionReportComponent } from './inventory-wardsupply/reports/consumption-report.component';
import { InternalConsumptionComponent } from './internal-consumption.component';
import { InternalConsumptionListComponent } from './internal-consumption-list.component';
import { InternalConsumptionDetailsComponent } from './internal-consumption-details.component';
import { WardInternalConsumptionReportComponent } from './reports/internal-consumption-report.component';
import { InventoryWardReceiveStockComponent } from './inventory-wardsupply/requisition/inventory-ward-receive-stock/inventory-ward-receive-stock.component';
import { WardSupplyAssetStockComponent } from './wardsupply-asset/wardsupply-asset-stock/wardsupply-asset-stock.component';
import { WardSupplyAssetRequisitionComponent } from './wardsupply-asset/wardsupply-asset-requisition/wardsupply-asset-new-requisition.component';
import { WardSupplyAssetReturnComponent } from './wardsupply-asset/wardsupply-asset-return/wardsupply-asset-new-return.component';
import { WardSupplyAssetRequisitionListComponent } from './wardsupply-asset/wardsupply-asset-requisition/wardsupply-asset-requisition-list.component';
import { WardSupplyAssetReturnListComponent } from './wardsupply-asset/wardsupply-asset-return/wardsupply-asset-return-list.component';
import { WardSupplyAssetMainComponent } from './wardsupply-asset/wardsupply-asset-main.component';
import { wardsupplyService } from './shared/wardsupply.service';
import { WardSupplyAssetRequisitionDetailsComponent } from './wardsupply-asset/wardsupply-asset-requisition/wardsupply-asset-requisition-details.component';
import { InventoryPatientConsumptionComponent } from './inventory-wardsupply/patient-consumption/inventory-ward-patient-consumption.component';
import { InventoryPatientConsumptionListComponent } from './inventory-wardsupply/patient-consumption/inventory-ward-patient-consumption-list.component';
import {WardSupplyAssetReqDispatchComponent} from './wardsupply-asset/wardsupply-asset-requisition/wardsupply-asset-req-dispatch/wardsupply-asset-req-dispatch-list.component'
@NgModule({
  providers: [
    WardSupplyBLService,
    WardSupplyDLService,
    PharmacyBLService,
    PharmacyDLService,
    PharmacyService,
    InventoryBLService,
    InventoryService,
    InventoryDLService,
    wardsupplyService,
    { provide: LocationStrategy, useClass: HashLocationStrategy }
  ],
  imports: [
    WardSupplyRoutingModule,
    CommonModule,
    ReactiveFormsModule,
    HttpClientModule,
    FormsModule,
    SharedModule,
    DanpheAutoCompleteModule
  ],

  declarations: [
    WardSupplyMainComponent,
    StockComponent,
    RequisitionComponent,
    ConsumptionComponent,
    ConsumptionListComponent,
    PharmacyTransferComponent,
    WardReportComponent,
    WardStockReportComponent,
    WardRequisitionReportComponent,
    WardDispatchReportComponent,
    WardDispatchReportComponent,
    WardConsumptionReportComponent,
    WardInternalConsumptionReportComponent,
    WardBreakageReportComponent,
    WardTransferReportComponent,
    PharmacyWardComponent,
    InventoryWardComponent,
    InventoryWardRequisitionItemComponent,
    InventoryRequisitionListComponent,
    InventoryRequisitionDetailsComponent,
    InventoryConsumptionComponent,
    InventoryConsumptionListComponent,
    WardPharmacyStockComponent,
    WardInventoryStockComponent,
    WardInventoryReportComponent,
    RequisitionDispatchReportComponent,
    TransferReportComponent,
    ConsumptionReportComponent,
    InternalConsumptionComponent,
    InternalConsumptionListComponent,
    InternalConsumptionDetailsComponent,
    InventoryWardReceiveStockComponent,
    WardSupplyAssetMainComponent,
    WardSupplyAssetStockComponent,
    WardSupplyAssetRequisitionComponent,
    WardSupplyAssetRequisitionListComponent,
    WardSupplyAssetReturnComponent,
    WardSupplyAssetReturnListComponent,
    WardSupplyAssetRequisitionDetailsComponent,
    InventoryPatientConsumptionListComponent,
    InventoryPatientConsumptionComponent,
    WardSupplyAssetReqDispatchComponent,
  ],
  bootstrap: []
})
export class WardSupplyModule { }
