import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { DetailStockLedger } from '../../shared/detail-stock-ledger.model';
import { GoodReceiptEvaluationReport } from '../goodreceipt-evaluation/goodreceipt-evaluation-report.model';
import { ApprovedMaterialStockRegisterReportModel } from './approved-material-stock-register-report.model';
import { CancelledPOandGRReport } from './cancelled-poandgr-report.model';
import { ConsumableStockModel } from './consumable-stock.model';
import { FixedAssetsReportModel } from './fixed-assets-report.model';
import { PurchaseOrderSummeryReport } from './purchase-order-summery-report.model';
@Injectable()
export class InventoryReportsDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  constructor(public http: HttpClient) {

  }


  ////GET:
  public GetAllVendorList() {
    return this.http.get<any>("/InventoryReports/GetAllVendorList", this.options);
  }

  public GetAllItemsList() {
    return this.http.get<any>("/InventoryReports/GetAllItemsList", this.options);
  }

  public GetAllStoreList() {
    return this.http.get<any>("/InventoryReports/GetAllStoreList", this.options);
  }

  public GetSupplierWiseStockReportList(obj) {
    return this.http.get<any>("/InventoryReports/SupplierWiseStockReport?FromDate=" + obj.FromDate + "&ToDate=" + obj.ToDate + "&VendorId=" + obj.VendorId + "&StoreId=" + obj.StoreId + "&ItemId=" + obj.ItemId);
  }

  ////GET: GET purchase ORder List
  public GetStockLevelReportData(ItemName) {
    // /Reporting/DailyAppointmentReport?FromDate=" + this.currentdailyappointment.fromDate 
    return this.http.get<any>("/InventoryReports/CurrentStockLevelReport?ItemName=" + ItemName);

  }

  public GetStockLevelReportDataByItemId(selectedIds) {
    return this.http.get<any>("/InventoryReports/CurrentStockLevelReportById?StoreIds=" + selectedIds);
  }

  public GetWriteOffReport(ItemId) {
    return this.http.get<any>("/InventoryReports/CurrentWriteOffReport?ItemId=" + ItemId);
  }

  public GetReturnToVendorReport(VendorId) {
    return this.http.get<any>("/InventoryReports/ReturnToVendorReport?VendorId=" + VendorId);
  }

  public GetFixedAssetsReportData(CurrentFixedAssets: FixedAssetsReportModel) {
    return this.http.get<any>("/InventoryReports/FixedAssetsReport?FromDate=" + CurrentFixedAssets.FromDate + "&ToDate=" + CurrentFixedAssets.ToDate);
  }

  public GetFixedAssetsMovementReportData(CurrentFixedAssets: FixedAssetsReportModel) {
    return this.http.get<any>("/InventoryReports/FixedAssetsMovementReport?FromDate=" + CurrentFixedAssets.FromDate + "&ToDate=" + CurrentFixedAssets.ToDate);
  }

  public GetShowDetailStockLedgerReportData(stockLedger: DetailStockLedger, selectedStoreId: number) {
    return this.http.get<any>(`/InventoryReports/DepartmentDetailStockLedgerReport?FromDate=${stockLedger.FromDate}&ToDate=${stockLedger.ToDate}&ItemId=${stockLedger.ItemId}&selectedStoreId=${selectedStoreId}`);
  }
  public GetShowConsumableStockLedgerReportData(stockLedger: ConsumableStockModel, selectedStoreId: number, fiscalYearId: number) {
    return this.http.get<any>(`/InventoryReports/ConsumableStockLedgerReport?FromDate=${stockLedger.FromDate}&ToDate=${stockLedger.ToDate}&ItemId=${stockLedger.ItemId}&selectedStoreId=${selectedStoreId}&fiscalYearId=${fiscalYearId}`);
  }
  public GetShowCapitalStockLedgerReportData(stockLedger: ConsumableStockModel, selectedStoreId: number, fiscalYearId: number) {
    return this.http.get<any>(`/InventoryReports/CapitalStockLedgerReport?FromDate=${stockLedger.FromDate}&ToDate=${stockLedger.ToDate}&ItemId=${stockLedger.ItemId}&selectedStoreId=${selectedStoreId}&fiscalYearId=${fiscalYearId}`);
  }
  public GetIssuedItemListReportDate(FromDate: any, ToDate: any, FiscalYearId: number, ItemId: number, SubStoreId: number, MainStoreId: number, EmployeeId: number, SubCategoryId: number) {
    return this.http.get<any>(`/InventoryReports/IssuedItemListReport?FromDate=${FromDate}&ToDate=${ToDate}&FiscalYearId=${FiscalYearId}&ItemId=${ItemId}&SubStoreId=${SubStoreId}&MainStoreId=${MainStoreId}&EmployeeId=${EmployeeId}&SubCategoryId=${SubCategoryId}`);
  }
  public GetOpeningStockValuationReportData(tillDate: any) {
    return this.http.get<any>(`/InventoryReports/OpeningStockValuationReport?TillDate=${tillDate}`);
  }

  public GetApprovedMaterialStockRegisterReportData(CurrentApprovedMaterialStockRegister: ApprovedMaterialStockRegisterReportModel) {
    return this.http.get<any>("/InventoryReports/ApprovedMaterialStockRegisterReport?FromDate=" + CurrentApprovedMaterialStockRegister.FromDate + "&ToDate=" + CurrentApprovedMaterialStockRegister.ToDate);

  }

  public GetDailyItemDispatchReportData(FromDate, ToDate, StoreId) {
    // /Reporting/DailyAppointmentReport?FromDate=" + this.currentdailyappointment.fromDate 
    return this.http.get<any>("/InventoryReports/DailyItemDispatchReport?FromDate=" + FromDate + "&ToDate=" + ToDate + "&StoreId=" + StoreId);

  }
  public GetPurchaseOrderReportData(CurrentPurchaseOrder: PurchaseOrderSummeryReport, StoreId: number) {
    // /Reporting/DailyAppointmentReport?FromDate=" + this.currentdailyappointment.fromDate 
    return this.http.get<any>("/InventoryReports/PurchaseOrderReport?FromDate=" + CurrentPurchaseOrder.FromDate + "&ToDate=" + CurrentPurchaseOrder.ToDate + "&StoreId=" + StoreId);
  }

  public GetInventorySummaryReportData(FromDate, ToDate, fiscalYearId, storeId) {
    // /Reporting/DailyAppointmentReport?FromDate=" + this.currentdailyappointment.fromDate 
    return this.http.get<any>("/InventoryReports/InventorySummaryReport?FromDate=" + FromDate + "&ToDate=" + ToDate + "&FiscalYearId=" + fiscalYearId + "&StoreId=" + storeId);

  }
  public GetInventoryValuationData() {
    return this.http.get<any>("/InventoryReports/InventoryValuationReport");
  }
  public GetItemMgmtReport() {
    return this.http.get<any>("/InventoryReports/ItemMgmtDetailReport");
  }
  public GetComparisonReport() {
    return this.http.get<any>("/InventoryReports/ComparisonPoGrReport");
  }
  public PurchaseItemsReport(FromDate, ToDate, fiscalYearId, ItemId) {
    return this.http.get<any>("/InventoryReports/INVPurchaseItemsReport?FromDate=" + FromDate + "&ToDate=" + ToDate + "&FiscalYearId=" + fiscalYearId + "&ItemId=" + ItemId);

  }
  public GetPurchaseReports() {
    return this.http.get<any>("/InventoryReports/PurchaseReport");
  }
  public GetCancelledPOGRReport(CurrentCancelledPOGR: CancelledPOandGRReport) {
    return this.http.get<any>("/InventoryReports/CancelledPOandGRReport?FromDate=" + CurrentCancelledPOGR.FromDate + "&ToDate=" + CurrentCancelledPOGR.ToDate + "&isGR=" + CurrentCancelledPOGR.isGR);
  }
  public GetGREvaluationReport(CurrentGREvaluation: GoodReceiptEvaluationReport) {
    return this.http.get<any>("/InventoryReports/GoodReceiptEvaluationReport?FromDate=" + CurrentGREvaluation.FromDate + "&ToDate=" + CurrentGREvaluation.ToDate + "&GoodReceiptNo=" + CurrentGREvaluation.GoodReceiptNo + "&TransactionType=" + CurrentGREvaluation.TransactionType);
  }
  public GetAllFiscalYears() {
    return this.http.get<any>("/api/Billing/BillingFiscalYears");
  }
  public GetCurrentFiscalYear() {
    return this.http.get<any>("/api/Billing/CurrentFiscalYear");
  }

  public showVendorTrasactionDetails(fiscalYearId, VendorId) {
    return this.http.get<any>("/InventoryReports/VendorTransactionReport?fiscalYearId=" + fiscalYearId + "&VendorId=" + VendorId);
  }
  public showVendorTrasactionData(fiscalYearId, VendorId) {
    return this.http.get<any>("/InventoryReports/VendorTransactionReportData?fiscalYearId=" + fiscalYearId + "&VendorId=" + VendorId);
  }

  public showSubstoreStockReport(StoreId, ItemId) {
    return this.http.get<any>("/InventoryReports/SubstoreStockReport?StoreId=" + StoreId + "&ItemId=" + ItemId);
  }
  public LoadInventoryStores() {
    return this.http.get<any>('/api/inventory/InventoryStores', this.options);
  }
  public GetItemDetailsByIds(selectedIds, itemId) {
    return this.http.get<any>("/InventoryReports/CurrentStockItemDetailsByStoreId?StoreIds=" + selectedIds + "&ItemId=" + itemId, this.options);
  }
  public GetPurchaseSummaryReport(fromDate, toDate, vendorId) {
    return this.http.get<any>("/InventoryReports/InvPurchaseSummaryReport?FromDate=" + fromDate + "&ToDate=" + toDate + "&VendorId=" + vendorId);
  }

  public GetItem() {
    return this.http.get<any>("/api/InventorySettings/Items");
  }

  public GetReturnToSupplierReport(obj: any) {
    return this.http.get<any>("/InventoryReports/InvReturnToSupplierReport?FromDate=" + obj.FromDate + "&ToDate=" + obj.ToDate + "&VendorId=" + obj.VendorId + "&ItemId=" + obj.ItemId
      + "&batchNumber=" + obj.BatchNumber + "&goodReceiptNumber=" + obj.GoodReceiptNumber + "&creditNoteNumber=" + obj.CreditNoteNumber);
  }

  ////Get:  Get Expiry Report Data
  public GetExpiryItemReport(itemId, storeId, fromDate, toDate) {
    return this.http.get<any>("/InventoryReports/ExpiryItemReport?ItemId=" + itemId + " &StoreId=" + storeId + "&FromDate=" + fromDate + "&ToDate=" + toDate, this.options);
  }

  public GetSupplierInformationReportList() {
    try {
      return this.http.get<any>("/InventoryReports/INVSupplierInformationReport", this.options);
    }
    catch (ex) { throw ex; }

  }
  public GetInventoryList() {
    return this.http.get<any>("/api/ActivateInventory/", this.options);
  }
  public GetSubstoreDispatchedAndConsumptionReport(StoreId, ItemId, SubCategoryId, fromDate, toDate) {
    return this.http.get<any>("/InventoryReports/SubstoreDispatchAndConsumptionReport?StoreId=" + StoreId + "&ItemId=" + ItemId + "&SubCategoryId=" + SubCategoryId + "&FromDate=" + fromDate + "&ToDate=" + toDate, this.options);
  }

  public GetExpirableStockReportData(FromDate, ToDate, FiscalYearId, ItemId) {
    return this.http.get<any>(`/InventoryReports/ExpirableStockReport?FromDate=${FromDate}&ToDate=${ToDate}&fiscalYearId=${FiscalYearId}&ItemId=${ItemId}`);
  }
  public GetSubstoreWiseSummaryReport(StoreId, fromDate, toDate, FiscalYearId) {
    return this.http.get<any>("/InventoryReports/SubstoreWiseSummaryReport?StoreId=" + StoreId + "&FromDate=" + fromDate + "&ToDate=" + toDate + "&FiscalYearId=" + FiscalYearId, this.options);
  }
  GetAllInventoryStores() {
    return this.http.get<any>(`/api/inventory/AllInventoryStores`, this.options);
  }

}
