import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DailyItemDispatchReport } from './daily-item-dispatch-report.model';
import { PurchaseOrderSummeryReport } from './purchase-order-summery-report.model';
import { InventorySummaryReport } from './inventory-summary-report.model';
import { FixedAssetsReportModel } from './fixed-assets-report.model';
import { CancelledPOandGRReport } from './cancelled-poandgr-report.model';
import { GoodReceiptEvaluationReport } from '../goodreceipt-evaluation/goodreceipt-evaluation-report.model';
import { ApprovedMaterialStockRegisterReportModel } from './approved-material-stock-register-report.model';
import { DetailStockLedger } from '../../shared/detail-stock-ledger.model';
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

  public GetShowDetailStockLedgerReportData(stockLedger: DetailStockLedger, selectedStoreId:number) {
    return this.http.get<any>(`/InventoryReports/DepartmentDetailStockLedgerReport?FromDate=${stockLedger.FromDate}&ToDate=${stockLedger.ToDate}&ItemId=${stockLedger.ItemId}&selectedStoreId=${selectedStoreId}`) ;
  }



  public GetApprovedMaterialStockRegisterReportData(CurrentApprovedMaterialStockRegister: ApprovedMaterialStockRegisterReportModel) {
    return this.http.get<any>("/InventoryReports/ApprovedMaterialStockRegisterReport?FromDate=" + CurrentApprovedMaterialStockRegister.FromDate + "&ToDate=" + CurrentApprovedMaterialStockRegister.ToDate);

  }

  public GetDailyItemDispatchReportData(FromDate, ToDate, StoreId) {
    // /Reporting/DailyAppointmentReport?FromDate=" + this.currentdailyappointment.fromDate 
    return this.http.get<any>("/InventoryReports/DailyItemDispatchReport?FromDate=" + FromDate + "&ToDate=" + ToDate + "&StoreId=" + StoreId);

  }
  public GetPurchaseOrderReportData(CurrentPurchaseOrder: PurchaseOrderSummeryReport,StoreId: number) {
    // /Reporting/DailyAppointmentReport?FromDate=" + this.currentdailyappointment.fromDate 
    return this.http.get<any>("/InventoryReports/PurchaseOrderReport?FromDate=" + CurrentPurchaseOrder.FromDate + "&ToDate=" + CurrentPurchaseOrder.ToDate +"&StoreId=" + StoreId);
  }

  public GetInventorySummaryReportData(FromDate, ToDate, fiscalYearId) {
    // /Reporting/DailyAppointmentReport?FromDate=" + this.currentdailyappointment.fromDate 
    return this.http.get<any>("/InventoryReports/InventorySummaryReport?FromDate=" + FromDate + "&ToDate=" + ToDate + "&FiscalYearId=" + fiscalYearId);

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
  public PurchaseItemsReport(FromDate, ToDate, fiscalYearId,ItemIds) {
    return this.http.get<any>("/InventoryReports/INVPurchaseItemsReport?FromDate=" + FromDate + "&ToDate=" + ToDate + "&FiscalYearId=" + fiscalYearId + "&ItemIds=" +ItemIds);

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
    return this.http.get<any>("/api/Billing?reqType=all-fiscalYears");
  }
  public GetCurrentFiscalYear() {
    return this.http.get<any>("/api/Billing?reqType=current-fiscalYear");
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
    return this.http.get<any>('/api/inventory?reqType=getInventoryStoreList', this.options);
  }
  public GetItemDetailsByIds(selectedIds, itemId) {
    return this.http.get<any>("/InventoryReports/CurrentStockItemDetailsByStoreId?StoreIds=" + selectedIds + "&ItemId=" + itemId, this.options);
  }
  public GetPurchaseSummaryReport(fromDate, toDate,vendorId) {
    return this.http.get<any>("/InventoryReports/InvPurchaseSummaryReport?FromDate=" + fromDate + "&ToDate=" + toDate + "&VendorId=" + vendorId );
  }

  public GetItem() {
    return this.http.get<any>("/api/InventorySettings?reqType=GetItemList");
  }

  public GetReturnToSupplierReport(obj :any) {
    return this.http.get<any>("/InventoryReports/InvReturnToSupplierReport?FromDate=" +obj.FromDate + "&ToDate=" + obj.ToDate + "&VendorId=" + obj.VendorId + "&ItemId=" + obj.ItemId
     + "&batchNumber=" + obj.BatchNumber + "&goodReceiptNumber=" + obj.GoodReceiptNumber  + "&creditNoteNumber=" + obj.CreditNoteNumber);
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
}
