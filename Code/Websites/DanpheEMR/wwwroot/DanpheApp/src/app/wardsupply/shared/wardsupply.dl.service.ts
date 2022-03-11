import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable()
export class WardSupplyDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  public optionsJson = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(public http: HttpClient) {

  }

  // GET: Stock Details 
  public GetAllWardItemsStockDetailsList(storeId: number) {
    return this.http.get<any>("/api/WardSupply?reqType=get-all-Ward-Items-StockDetails&StoreId=" + storeId, this.options);
  }
  // GET: Stock Details 
  public GetAvailableWardItemsStockDetailsList(storeId: number) {
    return this.http.get<any>("/api/WardSupply?reqType=get-available-Ward-Items-StockDetails&StoreId=" + storeId, this.options);
  }
  public GetSubstoreRequistionList(fromDate: string, toDate: string, storeId: number) {
    return this.http.get<any>('/api/WardSupply/GetSubstoreRequistionList/' + fromDate + '/' + toDate + '/' + storeId, this.optionsJson);
  }
  public GetDepartments() {
    return this.http.get<any>('/api/wardsupply?reqType=get-departments', this.options);
  }
  public GetWardInventoryStockDetailsList() {
    return this.http.get<any>("/api/WardSupply?reqType=get-all-inventory-Items-StockDetails", this.options);
  }
  public GetInventoryStockByStoreId(StoreId) {
    return this.http.get<any>("/api/WardSupply/GetInventoryItemsByStoreId/" + StoreId, this.options);
  }
  public GetFixedAssetStockBySubStoreId(subStoreId: number) {
    return this.http.get<any>("/api/WardSupplyAssets/GetFixedAssetStockBySubStoreId/" + subStoreId, this.options);
  }

  public GetSubstoreAssetRequistionItemsById(reqId: number) {
    return this.http.get<any>("/api/WardSupplyAssets/GetSubstoreAssetRequistionItemsById/" + reqId, this.options);
  }
    //swapnil-2-april-2021
  public GetSubstoreAssetReturnItemsById(returnId:number) {
    return this.http.get<any>("/api/WardSupplyAssets/GetSubstoreAssetReturnById/"+returnId, this.options);
  }
  //GET: get ward list.
  public GetActiveSubStoreList() {
    return this.http.get<any>("/api/WardSupply?reqType=active-substore-list", this.options);
  }
  //GET: get ward list.
  public WardList(StoreId) {
    return this.http.get<any>("/api/WardSupply?reqType=ward-list&StoreId=" + StoreId, this.options);
  }
  public GetInventoryList() {
    return this.http.get<any>("/api/ActivateInventory/", this.options);
  }
  // GET: Consumption Details 
  public GetAllComsumptionListDetails(wardId, storeId) {
    return this.http.get<any>("/api/WardSupply?reqType=get-All-Comsumption-List-Details&wardId=" + wardId + "&StoreId=" + storeId, this.options);
  }
  //GET: Inventory Consumption List
  public GetInventoryComsumptionListDetails(storeId, fromDate, toDate) {
    return this.http.get<any>("/api/WardSupply/GetInventoryConsumptionList/" + storeId + "/" + fromDate + "/" + toDate, this.options);
  }

  //GET: All Ward Request List
  public GetWardRequisitionList(status: string, storeId: number) {
    return this.http.get<any>("/api/WardSupply?reqType=get-all-requisition-list&status=" + status + "&StoreId=" + storeId, this.options)
  }

  //GET: ward req Items List
  public GetWardReqItemList(requisitionId) {
    return this.http.get<any>("/api/WardSupply?reqType=get-ward-request-items&requisitionId=" + requisitionId, this.options)
  }

  //GET: Consumption Items List
  public GetConsumptionItemList(patientId, wardId, storeId) {
    return this.http.get<any>("/api/WardSupply?reqType=get-consumption-items-list&patientId=" + patientId + "&wardId=" + wardId + "&StoreId=" + storeId, this.options)
  }
  //GET: Inventory Consumption Item List
  public GetInventoryConsumptionItemList(userName, storeId) {
    return this.http.get<any>("/api/WardSupply?reqType=get-inventory-consumption-itemlist&userName=" + userName + "&StoreId=" + storeId, this.options)
  }

  //GET:Internal Consumption Item List
  public GetInternalConsumptionList(storeId: number) {
    return this.http.get<any>("/api/WardSupply?reqType=get-internal-consumption-list&StoreId=" + storeId, this.options)
  }
  //GET:Internal Consumption Item List
  public GetInternalConsumptionItemList(consumptionId) {
    return this.http.get<any>("/api/WardSupply?reqType=get-internal-consumption-item-list&consumptionId=" + consumptionId, this.options)
  }
  //GET:Internal Consumption Item Details
  public GetInternalConsumptionDetails(consumptionId) {
    return this.http.get<any>("/api/WardSupply?reqType=get-internal-consumption-details&consumptionId=" + consumptionId, this.options)
  }
  //get phrm stock list
  GetItemTypeListWithItems() {
    return this.http.get<any>('/PharmacyReport/PHRMStoreStock?Status=', this.options);
  }
  //get ward stock list
  GetWardStockList() {
    return this.http.get<any>("/api/WardSupply?reqType=ward-stock");
  }
  //GET:patient List from Patient controller
  public GetPatients() {
    return this.http.get<any>("/api/WardSupply?reqType=inpatient-list", this.options);
  }
  //GET:patient List from Patient controller
  public GetDispatchListForItemReceive(RequisitionId) {
    return this.http.get<any>("/api/WardSupply/GetDispatchListForItemReceive/" + RequisitionId, this.options);
  }
  //GET: WardStockReport from Ward Report Controller
  public GetStockItemsReport(itemId, storeId) {
    try {
      return this.http.get<any>("/api/WardSupply/WARDStockItemsReport/" + itemId + "/" + storeId, this.options);
    }
    catch (ex) { throw ex; }
  }

  ////GET: Get Requisition Report
  public GetWardRequsitionReport(wardReports) {
    return this.http.get<any>("/api/WardSupply/WARDRequisitionReport/"
      + wardReports.FromDate + "/" + wardReports.ToDate + "/" + wardReports.StoreId, this.options)
  }

  ////GET: Get Breakage Report
  public GetWardBreakageReport(wardReports) {
    return this.http.get<any>("/api/WardSupply/WARDBreakageReport/"
      + wardReports.FromDate + "/" + wardReports.ToDate + "/" + wardReports.StoreId, this.options)
  }

  ////GET: Get Consumption Report
  public GetWardConsumptionReport(wardReports) {
    return this.http.get<any>("/api/WardSupply/WARDConsumptionReport/"
      + wardReports.FromDate + "/" + wardReports.ToDate + "/" + wardReports.StoreId, this.options)
  }

  ////GET: Get Internal Consumption Report
  public GetWardInernalConsumptionReport(wardReports) {
    return this.http.get<any>("/api/WardSupply/WARDInternalConsumptionReport/"
      + wardReports.FromDate + "/" + wardReports.ToDate + "/" + wardReports.StoreId, this.options)

  }
  ////GET: Get Transfer Report
  public GetWardTransferReport(wardReports) {
    return this.http.get<any>("/api/WardSupply/WARDTransferReport/"
      + wardReports.FromDate + "/" + wardReports.ToDate + "/" + wardReports.StoreId, this.options)
  }

  ////Ward Inventory Report
  ////GET: Get RequisitionDispatch Report
  public GetRequisitionDispatchReport(wardReports) {
    return this.http.get<any>("/api/WardSupply/Inventory/Reports/RequisitionDispatchReport/"
      + wardReports.FromDate + "/" + wardReports.ToDate + "/" + wardReports.StoreId, this.options)
  }

  ////GET: Get Transfer Report
  public GetTransferReport(wardReports) {
    return this.http.get<any>("/api/WardSupply/Inventory/Reports/TransferReport/"
      + wardReports.FromDate + "/" + wardReports.ToDate + "/" + wardReports.StoreId, this.options)
  }

  ////GET: Get Transfer Report
  public GetConsumptionReport(wardReports) {
    return this.http.get<any>("/api/WardSupply/Inventory/Reports/ConsumptionReport/"
      + wardReports.FromDate + "/" + wardReports.ToDate + "/" + wardReports.StoreId, this.options)
  }

  public GetDispatchDetails(RequisitionId: number) {
    return this.http.get<any>('/api/WardSupplyAssets/dispatchview/' + RequisitionId,this.options);
  }
  //POST
  //post consumption data
  PostConsumptionData(consumptiondata) {
    let data = JSON.stringify(consumptiondata);
    return this.http.post<any>("/api/WardSupply?reqType=post-consumption", data, this.options);
  }
  //post internal consumption data
  PostInternalConsumptionData(internalconsumptiondata) {
    let data = JSON.stringify(internalconsumptiondata);
    return this.http.post<any>("/api/WardSupply?reqType=post-internal-consumption", data, this.options);
  }
  //post consumption data
  PostInventoryConsumptionData(consumptiondata) {
    let data = JSON.stringify(consumptiondata);
    return this.http.post<any>("/api/WardSupply?reqType=post-inventory-consumption", data, this.options);
  }
  //Post to Stock table and post to Transaction table 
  PostManagedStockDetails(data, ReceivedBy) {
    try {
      return this.http.post<any>("/api/TransferStock/" + ReceivedBy, data, this.optionsJson);
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

  //GET: Get CapitalGoodsItemList
  public GetCapitalGoodsItemList() {
    return this.http.get<any>('/api/WardSupplyAssets/GetCapitalGoodsItemList/', this.options);
  }

  //Posting the  Requisiton and requisitionItems table FixedAssetRequisition/FixedAssetRequisitionItems
  public PostToAssetRequisition(RequisitionObjString: string) {
    let data = RequisitionObjString;
    return this.http.post<any>("/api/WardSupplyAssets?reqType=AssetRequisition", data, this.options);
  }
    //swapnil-2-april-2021
  //Posting the  Return and returnItems table FixedAssetReturn/FixedAssetReturnItems
  public PostToAssetReturn(ReturnObjString: string) {
  let data = ReturnObjString;
  return this.http.post<any>("/api/WardSupplyAssets?reqType=AssetReturn", data, this.options);
  }

    
  //GET: Requisition List
  public GetSubstoreAssetRequistionList(fromDate: string, toDate: string, subStoreId: number) {
    return this.http.get<any>('/api/WardSupplyAssets/GetSubstoreAssetRequistionList/' + fromDate + '/' + toDate + '/' + subStoreId, this.optionsJson);
  }
  public GetSubstoreAssetReturnList(fromDate: string, toDate: string, subStoreId: number) {
    return this.http.get<any>('/api/WardSupplyAssets/GetSubstoreAssetReturnList/' + fromDate + '/' + toDate + '/' + subStoreId, this.optionsJson);
  }

  //post ward stock to Pharmacy
  public PostReturnStock(data, ReceivedBy) {
    return this.http.post<any>("/api/RetrunStockToPharmacy/" + ReceivedBy, data, this.optionsJson);
  }
  //Put Consumption Item List
  PutConsumptionData(consumptiondata) {
    let data = JSON.stringify(consumptiondata);
    return this.http.put<any>("/api/WardSupply/put-consumption", data, this.options);
  }
  //Put Internal Consumption Item List
  PutInternalConsumptionData(internalconsumptiondata) {
    let data = JSON.stringify(internalconsumptiondata);
    return this.http.put<any>("/api/WardSupply/put-intrenal-consumption", data, this.options);
  }

  //PUT UpdateDispatchReceiveStatus
  PutUpdateDispatchedItemsReceiveStatus(dispatchId, receivedRemarks) {
    return this.http.put<any>("/api/WardSupply/UpdateDispatchedItemsReceiveStatus/" + dispatchId, receivedRemarks, this.optionsJson);
  }
  //PUT UpdateRequisition
  PutUpdateRequisition(requisition: string) {
    let data = requisition;
    return this.http.put<any>("/api/WardSupply/UpdateRequisition", data, this.options);
  }
  //post Return data
  PostReturnData(returnData) {
    let data = JSON.stringify(returnData);
    return this.http.put<any>("/api/WardSupplyAssets/ReturnData", data, this.options);
  }

  PutSendStockToCssd(FixedAssetStockId: number) {
    return this.http.put<any>(`/api/WardSupplyAssets/SendStockToCssd?FixedAssetStockId=${FixedAssetStockId}`, this.options);
  }

  //GET: Get AllPatients
  public GetAllPatients(searchTxt) {
    return this.http.get<any>("/api/Patient?reqType=patientsWithVisitsInfo&search=" + searchTxt, this.options);
  }

  PostInventoryPatConsumptionData(consumptiondata) {
    let data = JSON.stringify(consumptiondata);
    return this.http.post<any>("/api/WardSupply/PostInvPatientConsumption", data);
  }

  public GetInventoryItemsForPatConsumptionByStoreId(StoreId) {
    return this.http.get<any>("/api/WardSupply/GetInventoryItemsForPatConsumptionByStoreId/" + StoreId, this.options);
  }


  public GetInventoryPatientComsumptionReceiptList(storeId, fromDate, toDate) {
    return this.http.get<any>("/api/WardSupply/GetInventoryPatientConsumptionReceiptList/" + storeId + "/" + fromDate + "/" + toDate, this.options);
  }

  public GetInventoryPatConsumptionItemListById(receiptId) {
    return this.http.get<any>("/api/WardSupply/GetInventoryPatConsumptionItemlistById/" + receiptId)
  }
   //GET:patient List from Patient controller
   public GetFixedAssetDispatchListForItemReceive(RequisitionId) {
    return this.http.get<any>("/api/WardSupply/GetFixedAssetDispatchListForItemReceive/" + RequisitionId, this.options);
  }
}
