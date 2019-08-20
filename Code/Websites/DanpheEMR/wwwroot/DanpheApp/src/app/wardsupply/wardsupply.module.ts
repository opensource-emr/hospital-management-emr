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
  ],
  bootstrap: []
})
export class WardSupplyModule { }
