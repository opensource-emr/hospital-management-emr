import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class WardSupplyDLService {

  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };

  constructor(public http: HttpClient) {

  }

  // GET: Stock Details 
  public GetAllWardItemsStockDetailsList() {
    return this.http.get<any>("/api/WardSupply?reqType=get-all-Ward-Items-StockDetails", this.options);
  }

  public GetDepartments() {
    return this.http.get<any>('/api/wardsupply?reqType=get-departments', this.options);
  }
  public GetWardInventoryStockDetailsList() {
    return this.http.get<any>("/api/WardSupply?reqType=get-all-inventory-Items-StockDetails", this.options);
  }
  //GET: get ward list.
  public WardList() {
    return this.http.get<any>("/api/WardSupply?reqType=ward-list", this.options);
  }

  // GET: Consumption Details 
  public GetAllComsumptionListDetails(wardId) {
    return this.http.get<any>("/api/WardSupply?reqType=get-All-Comsumption-List-Details&wardId=" + wardId, this.options);
  }
  //GET: Inventory Consumption List
  public GetInventoryComsumptionListDetails(departmentId) {
    return this.http.get<any>("/api/WardSupply?reqType=get-inventory-conumption-list&departmentId=" + departmentId, this.options);
  }

  //GET: All Ward Request List
  public GetWardRequisitionList(status: string, wardId: number) {
    return this.http.get<any>("/api/WardSupply?reqType=get-all-ward-requisition-list&status=" + status + "&wardId=" + wardId, this.options)
  }

  //GET: ward req Items List
  public GetWardReqItemList(requisitionId) {
    return this.http.get<any>("/api/WardSupply?reqType=get-ward-request-items&requisitionId=" + requisitionId, this.options)
  }

  //GET: Consumption Items List
  public GetConsumptionItemList(patientId, wardId) {
    return this.http.get<any>("/api/WardSupply?reqType=get-consumption-items-list&patientId=" + patientId + "&wardId=" + wardId, this.options)
  }
  //GET: Inventory Consumption Item List
  public GetInventoryConsumptionItemList(userName, departmentId) {
    return this.http.get<any>("/api/WardSupply?reqType=get-inventory-consumption-itemlist&departmentId=" + departmentId + "&userName=" + userName, this.options)
  }

  //get phrm stock list
  GetItemTypeListWithItems() {
    return this.http.get<any>('/api/Pharmacy?reqType=itemtypeListWithItems', this.options);
  }
  //get ward stock list
  GetWardStockList() {
    return this.http.get<any>("/api/WardSupply?reqType=ward-stock");
  }
  //GET:patient List from Patient controller
  public GetPatients() {
    return this.http.get<any>("/api/WardSupply?reqType=inpatient-list", this.options);
  }
  //GET: WardStockReport from Ward Report Controller
  public GetStockItemsReport(itemId) {
    try {
      return this.http.get<any>("/api/WardSupply/WARDStockItemsReport/" + itemId, this.options);
    }
    catch (ex) { throw ex; }
  }

  ////GET: Get Requisition Report
  public GetWardRequsitionReport(wardReports) {
    return this.http.get<any>("/api/WardSupply/WARDRequisitionReport/"
      + wardReports.FromDate + "/" + wardReports.ToDate, this.options)
  }

  ////GET: Get Breakage Report
  public GetWardBreakageReport(wardReports) {
    return this.http.get<any>("/api/WardSupply/WARDBreakageReport/"
      + wardReports.FromDate + "/" + wardReports.ToDate, this.options)
  }

  ////GET: Get Consumption Report
  public GetWardConsumptionReport(wardReports) {
    return this.http.get<any>("/api/WardSupply/WARDConsumptionReport/"
      + wardReports.FromDate + "/" + wardReports.ToDate, this.options)
  }

  ////GET: Get Transfer Report
  public GetWardTransferReport(wardReports) {
    return this.http.get<any>("/api/WardSupply/WARDTransferReport/"
      + wardReports.FromDate + "/" + wardReports.ToDate + "/" + wardReports.Status, this.options)
  }

  ////Ward Inventory Report
  ////GET: Get RequisitionDispatch Report
  public GetRequisitionDispatchReport(wardReports) {
    return this.http.get<any>("/api/WardSupply/Inventory/Reports/RequisitionDispatchReport/"
      + wardReports.FromDate + "/" + wardReports.ToDate, this.options)
  }

  ////GET: Get Transfer Report
  public GetTransferReport(wardReports) {
    return this.http.get<any>("/api/WardSupply/Inventory/Reports/TransferReport/"
      + wardReports.FromDate + "/" + wardReports.ToDate, this.options)
  }

  ////GET: Get Transfer Report
  public GetConsumptionReport(wardReports) {
    return this.http.get<any>("/api/WardSupply/Inventory/Reports/ConsumptionReport/"
      + wardReports.FromDate + "/" + wardReports.ToDate, this.options)
  }


  //POST
  //post consumption data
  PostConsumptionData(consumptiondata) {
    let data = JSON.stringify(consumptiondata);
    return this.http.post<any>("/api/WardSupply?reqType=post-consumption", data, this.options);
  }
  //post consumption data
  PostInventoryConsumptionData(consumptiondata) {
    let data = JSON.stringify(consumptiondata);
    return this.http.post<any>("/api/WardSupply?reqType=post-inventory-consumption", data, this.options);
  }
  //Post to Stock table and post to Transaction table 
  PostManagedStockDetails(data) {
    try {
      return this.http.post<any>("/api/WardSupply?reqType=transfer-stock", data, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  //Post to Stock table and post to Transaction table
  PostInventoryStockTransfer(data) {
    try {
      return this.http.post<any>("/api/WardSupply?reqType=transfer-inventory-stock", data, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  //Post to Stock table and post to Transaction table
  PostBackToInventory(data) {
    try {
      return this.http.post<any>("/api/WardSupply?reqType=transfer-back-to-inventory", data, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  //Post to Stock table and Transaction table for breakage items
  PostBreakageStockDetails(data) {
    try {
      return this.http.post<any>("/api/WardSupply?reqType=breakage-stock", data, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  //post ward request to phrm.
  public PostWardRequisition(requisitionObjString: string) {

    let data = requisitionObjString;
    return this.http.post<any>("/api/WardSupply?reqType=ward-requistion", data, this.options);

  }
  //post ward stock to Pharmacy
  public PostReturnStock(data) {
    return this.http.post<any>("/api/WardSupply?reqType=returnStockToPharmacy", data, this.options);
  }
}
