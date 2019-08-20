import { Injectable, Directive } from '@angular/core';
import * as _ from 'lodash';

import { InventoryReportsDLService } from './inventory-reports.dl.service';

@Injectable()
export class InventoryReportsBLService {
    //public PurchaseOrderItems: PurchaseOrderItems = null; 

    constructor(public inventoryDLService: InventoryReportsDLService) {

    }

    public ShowStockLevelReportData(ItemName) {
        return this.inventoryDLService.GetStockLevelReportData(ItemName);

    }

    public ShowStockLevelReportDataByItemId(ItemId) {
        return this.inventoryDLService.GetStockLevelReportDataByItemId(ItemId);

    }
  
    public ShowWriteOffReport(ItemId) {
      return this.inventoryDLService.GetWriteOffReport(ItemId);

    }

    public ShowReturnToVendor(VendorId) {
      return this.inventoryDLService.GetReturnToVendorReport(VendorId);

    }
    
    public ShowDailyItemDispatch(CurrentItemDispatch) {
        return this.inventoryDLService.GetDailyItemDispatchReportData(CurrentItemDispatch) ;
    }
    public ShowPurchaseOrder(CurrentPurchaseOrder) {
        return this.inventoryDLService.GetPurchaseOrderReportData(CurrentPurchaseOrder);
    }
    
    public ShowInventorySummary(CurrentInventorySummary) {
        return this.inventoryDLService.GetInventorySummaryReportData(CurrentInventorySummary);
    }

    public ShowInvValuation() {
        return this.inventoryDLService.GetInventoryValuationData();
    }
    public ShowComporisonReports() {
        return this.inventoryDLService.GetComparisonReport();
    }

    public ShowPurchaseReports() {
        return this.inventoryDLService.GetPurchaseReports();
    }

  public ShowFixedAssets(CurrentFixedAssets) {
    return this.inventoryDLService.GetFixedAssetsReportData(CurrentFixedAssets);
    }
    
}
