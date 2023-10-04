import { Injectable } from '@angular/core';
import { DetailStockLedger } from '../../shared/detail-stock-ledger.model';
import { ConsumableStockModel } from './consumable-stock.model';

import { InventoryReportsDLService } from './inventory-reports.dl.service';

@Injectable()
export class InventoryReportsBLService {
  //public PurchaseOrderItems: PurchaseOrderItems = null; 

  constructor(public inventoryDLService: InventoryReportsDLService) {

  }

  public GetAllVendorList() {
    return this.inventoryDLService.GetAllVendorList()
      .map(res => { return res });
  }

  public GetAllItemsList() {
    return this.inventoryDLService.GetAllItemsList()
      .map(res => { return res });
  }

  public GetAllStoreList() {
    return this.inventoryDLService.GetAllStoreList()
      .map(res => { return res });
  }

  public GetSupplierWiseStockReportList(data) {
    return this.inventoryDLService.GetSupplierWiseStockReportList(data)
      .map(res => { return res });
  }

  public ShowStockLevelReportData(ItemName) {
    return this.inventoryDLService.GetStockLevelReportData(ItemName);

  }

  public ShowStockLevelReportDataByItemId(selectedIds) {
    return this.inventoryDLService.GetStockLevelReportDataByItemId(selectedIds);

  }

  public ShowWriteOffReport(ItemId) {
    return this.inventoryDLService.GetWriteOffReport(ItemId);

  }

  public ShowReturnToVendor(VendorId) {
    return this.inventoryDLService.GetReturnToVendorReport(VendorId);

  }

  public ShowDailyItemDispatch(FromDate, ToDate, StoreId) {
    return this.inventoryDLService.GetDailyItemDispatchReportData(FromDate, ToDate, StoreId);
  }
  public ShowPurchaseOrder(CurrentPurchaseOrder, StoreId) {
    return this.inventoryDLService.GetPurchaseOrderReportData(CurrentPurchaseOrder, StoreId);
  }

  public ShowInventorySummary(FromDate, ToDate, fiscalYearId, storeId) {
    return this.inventoryDLService.GetInventorySummaryReportData(FromDate, ToDate, fiscalYearId, storeId);
  }

  public ShowInvValuation() {
    return this.inventoryDLService.GetInventoryValuationData();
  }
  public ShowItemmgmtReport() {
    return this.inventoryDLService.GetItemMgmtReport();
  }
  public ShowComporisonReports() {
    return this.inventoryDLService.GetComparisonReport();
  }
  public PurchaseItemsReport(FromDate, ToDate, fiscalYearId, ItemId) {
    return this.inventoryDLService.PurchaseItemsReport(FromDate, ToDate, fiscalYearId, ItemId);
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

  public ShowFixedAssetsMovement(CurrentFixedAssets) {
    return this.inventoryDLService.GetFixedAssetsMovementReportData(CurrentFixedAssets);
  }

  public ShowDetailStockLedger(stockLedger: DetailStockLedger, selectedStoreId: number) {
    return this.inventoryDLService.GetShowDetailStockLedgerReportData(stockLedger, selectedStoreId);
  }
  public ConsumableStockLedger(stockLedger: ConsumableStockModel, selectedStoreId: number, fiscalYearId: number) {
    return this.inventoryDLService.GetShowConsumableStockLedgerReportData(stockLedger, selectedStoreId, fiscalYearId);
  }

  public CapitalStockLedger(stockLedger: ConsumableStockModel, selectedStoreId: number, fiscalYearId: number) {
    return this.inventoryDLService.GetShowCapitalStockLedgerReportData(stockLedger, selectedStoreId, fiscalYearId);
  }
  public IssuedItemListReport(FromDate: any, ToDate: any, FiscalYearId: number, ItemId: number, SubStoreId: number, MainStoreId: number, EmployeeId: number, SubCategoryId: number) {
    return this.inventoryDLService.GetIssuedItemListReportDate(FromDate, ToDate, FiscalYearId, ItemId, SubStoreId, MainStoreId, EmployeeId, SubCategoryId);
  }
  public GetOpeningStockValuationReport(tillDate: any) {
    return this.inventoryDLService.GetOpeningStockValuationReportData(tillDate);
  }

  public ShowApprovedMaterialStockRegister(CurrentApprovedMaterialStockRegister) {
    return this.inventoryDLService.GetApprovedMaterialStockRegisterReportData(CurrentApprovedMaterialStockRegister);
  }

  public GetAllFiscalYears() {
    return this.inventoryDLService.GetAllFiscalYears()
      .map(res => res);
  }
  public GetCurrentFiscalYear() {
    return this.inventoryDLService.GetCurrentFiscalYear()
      .map(res => res);
  }
  public showVendorTrasactionDetails(fiscalYear, VendorId) {
    return this.inventoryDLService.showVendorTrasactionDetails(fiscalYear, VendorId).map(res => res);
  }
  public showVendorTrasactionData(fiscalYear, VendorId) {
    return this.inventoryDLService.showVendorTrasactionData(fiscalYear, VendorId).map(res => res);
  }
  public showSubstoreStockReport(StoreId, ItemId) {
    return this.inventoryDLService.showSubstoreStockReport(StoreId, ItemId).map(res => res);
  }
  public LoadInventoryStores() {
    return this.inventoryDLService.LoadInventoryStores()
      .map(res => res);
  }
  public GetItemDetailsByIds(selectedIds, itemId) {
    return this.inventoryDLService.GetItemDetailsByIds(selectedIds, itemId)
      .map(res => res);
  }
  public GetPurchaseSummaryReport(fromDate, toDate, vendorId) {
    return this.inventoryDLService.GetPurchaseSummaryReport(fromDate, toDate, vendorId)
      .map(res => { return res });
  }

  public GetItem() {
    return this.inventoryDLService.GetItem()
      .map(res => { return res });
  }

  public GetReturnToSupplierReport(obj) {
    return this.inventoryDLService.GetReturnToSupplierReport(obj)
      .map(res => { return res });
  }
  ////Get: Get Expiry Item Report Data
  public GetExpiryItemReport(itemId: number, storeId: number, fromDate, toDate) {
    return this.inventoryDLService.GetExpiryItemReport(itemId, storeId, fromDate, toDate)
      .map(res => { return res });
  }
  public GetSupplierInformationReportList() {
    try {
      return this.inventoryDLService.GetSupplierInformationReportList()
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }

  }
  GetInventoryList() {
    return this.inventoryDLService.GetInventoryList()
      .map(res => { return res });
  }
  GetSubstoreDispatchedAndConsumptionReport(StoreId, ItemId, SubCategoryId, fromDate, toDate) {
    return this.inventoryDLService.GetSubstoreDispatchedAndConsumptionReport(StoreId, ItemId, SubCategoryId, fromDate, toDate).map(res => { return res });
  }
  public GetExpirableStockReportData(FromDate, ToDate, FiscalYearId, ItemId) {
    return this.inventoryDLService.GetExpirableStockReportData(FromDate, ToDate, FiscalYearId, ItemId);
  }
  GetSubstoreWiseSummaryReport(StoreId, fromDate, toDate, FiscalYearId) {
    return this.inventoryDLService.GetSubstoreWiseSummaryReport(StoreId, fromDate, toDate, FiscalYearId).map(res => { return res });
  }
  public GetAllSubStores() {
    return this.inventoryDLService.GetAllInventoryStores()
      .map((responseData) => {
        return responseData;
      });
  }
}
