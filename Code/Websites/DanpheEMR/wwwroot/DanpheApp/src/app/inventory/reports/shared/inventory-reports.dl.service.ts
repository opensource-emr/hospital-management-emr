import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DailyItemDispatchReport } from './daily-item-dispatch-report.model';
import { PurchaseOrderSummeryReport } from './purchase-order-summery-report.model';
import { InventorySummaryReport } from './inventory-summary-report.model';
import { FixedAssetsReportModel } from './fixed-assets-report.model';
@Injectable()
export class InventoryReportsDLService {
 public options =  {
        headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })};
    constructor(public http: HttpClient) {

    }

    
    ////GET:
    ////GET: GET purchase ORder List
    public GetStockLevelReportData(ItemName) {
       // /Reporting/DailyAppointmentReport?FromDate=" + this.currentdailyappointment.fromDate 
        return this.http.get<any>("/InventoryReports/CurrentStockLevelReport?ItemName=" + ItemName);
        
    }

    public GetStockLevelReportDataByItemId(ItemId) {
        return this.http.get<any>("/InventoryReports/CurrentStockLevelReportById?ItemId=" + ItemId);
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
    public GetDailyItemDispatchReportData(CurrentItemDispatch: DailyItemDispatchReport ) {
        // /Reporting/DailyAppointmentReport?FromDate=" + this.currentdailyappointment.fromDate 
      return this.http.get<any>("/InventoryReports/DailyItemDispatchReport?FromDate=" + CurrentItemDispatch.FromDate + "&ToDate=" + CurrentItemDispatch.ToDate + "&DepartmentName=" + CurrentItemDispatch.DepartmentName);

    }
    public GetPurchaseOrderReportData(CurrentPurchaseOrder: PurchaseOrderSummeryReport) {
        // /Reporting/DailyAppointmentReport?FromDate=" + this.currentdailyappointment.fromDate 
        return this.http.get<any>("/InventoryReports/PurchaseOrderReport?FromDate=" + CurrentPurchaseOrder.FromDate + "&ToDate=" + CurrentPurchaseOrder.ToDate + "&OrderNumber=" + CurrentPurchaseOrder.OrderNumber);

    }

    public GetInventorySummaryReportData(CurrentInventorySummary: InventorySummaryReport) {
        // /Reporting/DailyAppointmentReport?FromDate=" + this.currentdailyappointment.fromDate 
        return this.http.get<any>("/InventoryReports/InventorySummaryReport?FromDate=" + CurrentInventorySummary.FromDate + "&ToDate=" + CurrentInventorySummary.ToDate + "&ItemName=" + CurrentInventorySummary.ItemName);

    }

    public GetInventoryValuationData() {
        return this.http.get<any>("/InventoryReports/InventoryValuationReport");
    }    

    public GetComparisonReport() {
        return this.http.get<any>("/InventoryReports/ComparisonPoGrReport");
    }

    public GetPurchaseReports() {
        return this.http.get<any>("/InventoryReports/PurchaseReport");
    }
    
}
