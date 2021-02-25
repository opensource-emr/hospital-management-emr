import { toDate } from '@angular/common/src/i18n/format_date';
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

  public ShowStockLevelReportDataByItemId(selectedIds) {
    return this.inventoryDLService.GetStockLevelReportDataByItemId(selectedIds);

  }

  
  //get substore dispatch and consumption details
  public GetDispatchAndConsumptionDetails(selectedIds, fromDate, toDate){
    return this.inventoryDLService.GetDispatchAndConsumptionDetails(selectedIds, fromDate, toDate)
      .map((responseData) => {
        return responseData;
      });
  }

  public GetDetailsforDispConItems(selectedIds, itemId, fromDate, toDate){
    return this.inventoryDLService.GetDetailsforDispConItems(selectedIds, itemId, fromDate, toDate)
      .map((responseData) => {
        return responseData;
      })
  }

  public ShowWriteOffReport(ItemId) {
    return this.inventoryDLService.GetWriteOffReport(ItemId);

  }

  public ShowReturnToVendor(VendorId) {
    return this.inventoryDLService.GetReturnToVendorReport(VendorId);

  }

  public ShowDailyItemDispatch(FromDate, ToDate ,StoreId) {
    return this.inventoryDLService.GetDailyItemDispatchReportData( FromDate , ToDate ,StoreId);
  }
  public ShowPurchaseOrder(CurrentPurchaseOrder) {
    return this.inventoryDLService.GetPurchaseOrderReportData(CurrentPurchaseOrder);
  }

  public ShowInventorySummary(FromDate, ToDate,fiscalYearId) {
    return this.inventoryDLService.GetInventorySummaryReportData(FromDate, ToDate,fiscalYearId);
  }

  public ShowInvValuation() {
    return this.inventoryDLService.GetInventoryValuationData();
  }
  public ShowItemmgmtReport(){
    return this.inventoryDLService.GetItemMgmtReport();
  }
  public ShowComporisonReports() {
    return this.inventoryDLService.GetComparisonReport();
  }
  public PurchaseItemsReport(FromDate, ToDate,fiscalYearId) {
    return this.inventoryDLService.PurchaseItemsReport(FromDate, ToDate,fiscalYearId);
  }
  public ShowPurchaseReports() {
    return this.inventoryDLService.GetPurchaseReports();
  }
  public ShowCancelledPOGRReport(CurrentCancelledPOGR) {
    return this.inventoryDLService.GetCancelledPOGRReport(CurrentCancelledPOGR);
  }
  public ShowGREvaluationReport(CurrentCancelledPOGR) {
    return this.inventoryDLService.GetGREvaluationReport(CurrentCancelledPOGR);
  }

  public ShowFixedAssets(CurrentFixedAssets) {
    return this.inventoryDLService.GetFixedAssetsReportData(CurrentFixedAssets);
  }

  public GetAllFiscalYears() {
    return this.inventoryDLService.GetAllFiscalYears()
      .map(res => res);
  }
  public GetCurrentFiscalYear() {
    return this.inventoryDLService.GetCurrentFiscalYear()
      .map(res => res);
  }
  public showVendorTrasactionDetails(fiscalYear,VendorId) {
    return this.inventoryDLService.showVendorTrasactionDetails(fiscalYear,VendorId).map(res => res);
  }
  public showVendorTrasactionData(fiscalYear,VendorId) {
    return this.inventoryDLService.showVendorTrasactionData(fiscalYear,VendorId).map(res => res);
  }
  public showSubstoreStockReport(StoreId,ItemId) {
    return this.inventoryDLService.showSubstoreStockReport(StoreId, ItemId).map(res => res);
  }
  public ShowVendorList() {
    return this.inventoryDLService.ShowVendorList()
      .map(res => res);
  }
  public GetItemDetailsByIds(selectedIds,itemId) {
    return this.inventoryDLService.GetItemDetailsByIds(selectedIds,itemId)
      .map(res => res);
  }
  public GetPurchaseSummaryReport(fromDate, toDate) {
    return this.inventoryDLService.GetPurchaseSummaryReport(fromDate, toDate)
      .map(res => { return res });
  }
}
