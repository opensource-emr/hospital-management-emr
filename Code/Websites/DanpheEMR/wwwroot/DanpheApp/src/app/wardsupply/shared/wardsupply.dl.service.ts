import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class WardSupplyDLService {
  readonly baseApiUrl = "/api/WardSupply";
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  public optionsJson = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };

  constructor(public http: HttpClient) {

  }

  public GetDepartments() {
    return this.http.get<any>(`${this.baseApiUrl}/Departments`, this.options);
  }
  public WardList(StoreId) {
    return this.http.get<any>(`${this.baseApiUrl}/Wards?StoreId=${StoreId}`, this.options);
  }
  public GetActiveSubStoreList() {
    return this.http.get<any>(`${this.baseApiUrl}/ActiveSubstores`, this.options);
  }
  public GetWardRequisitionList(status: string, storeId: number) {
    return this.http.get<any>(`${this.baseApiUrl}/Requisitions?StoreId=${storeId}`, this.options)
  }
  public GetAllComsumptionListDetails(wardId, storeId) {
    return this.http.get<any>(`${this.baseApiUrl}/ConsumptionDetails?StoreId=${storeId}&WardId=${wardId}`, this.options);
  }
  public GetInternalConsumptionDetails(consumptionId) {
    return this.http.get<any>(`${this.baseApiUrl}/InternalConsumptionDetailsById/${consumptionId}`, this.options)
  }
  public GetInternalConsumptionList(storeId: number) {
    return this.http.get<any>(`${this.baseApiUrl}/InternalConsumptions?StoreId=${storeId}`, this.options)
  }
  public GetInternalConsumptionItemList(consumptionId) {
    return this.http.get<any>(`${this.baseApiUrl}/InternalConsumptionItemListById/${consumptionId}`, this.options)
  }
  public GetWardReqItemList(requisitionId) {
    return this.http.get<any>(`${this.baseApiUrl}/RequisitionItemsById/${requisitionId}`, this.options)
  }

  public GetConsumptionItemList(patientId, wardId, storeId) {
    return this.http.get<any>(`${this.baseApiUrl}/PatientConsumptionItemList?PatientId=${patientId}&StoreId=${storeId}&WardId=${wardId}`, this.options)
  }
  public GetInventoryConsumptionItemList(userName, storeId) {
    return this.http.get<any>(`${this.baseApiUrl}/InventoryConsumptionItemList?StoreId${storeId}&UserName=${userName}`, this.options)
  }
  public GetAllWardItemsStockDetailsList(storeId: number) {
    return this.http.get<any>(`${this.baseApiUrl}/WardStock?StoreId=${storeId}`, this.options);
  }
  public GetAvailableWardItemsStockDetailsList(storeId: number) {
    return this.http.get<any>(`${this.baseApiUrl}/AvailableWardStock?StoreId=${storeId}`, this.options);
  }
  public GetPatients() {
    return this.http.get<any>(`${this.baseApiUrl}/InPatientList`, this.options);
  }
  public GetInventoryStockByStoreId(StoreId) {
    return this.http.get<any>(`${this.baseApiUrl}/GetInventoryItemsByStoreId/${StoreId}`, this.options);
  }
  public GetInventorySubStoreItemsByStoreIdForReturn(subStoreId: number) {
    return this.http.get<any>(`${this.baseApiUrl}/GetInventorySubStoreItemsByStoreIdForReturn/${subStoreId}`, this.options);
  }
  public GetInventoryItemsForPatConsumptionByStoreId(StoreId) {
    return this.http.get<any>(`${this.baseApiUrl}/GetInventoryItemsForPatConsumptionByStoreId/${StoreId}`, this.options);
  }
  public GetInventoryPatConsumptionItemListById(receiptId) {
    return this.http.get<any>(`${this.baseApiUrl}/GetInventoryPatConsumptionItemlistById/${receiptId}`, this.options);
  }
  public GetInventoryComsumptionListDetails(storeId, fromDate, toDate) {
    return this.http.get<any>(`${this.baseApiUrl}/GetInventoryConsumptionList/${storeId}/${fromDate}/${toDate}`, this.options);
  }

  public GetSubstoreRequistionList(fromDate: string, toDate: string, storeId: number) {
    return this.http.get(`/api/WardSupply/GetSubstoreRequistionList?fromDate=${fromDate}&toDate=${toDate}&storeId=${storeId}`, this.options);
  }

  public GetFixedAssetStockBySubStoreId(subStoreId: number) {
    return this.http.get<any>("/api/WardSupplyAssets/GetFixedAssetStockBySubStoreId/" + subStoreId, this.options);
  }


  public GetSubstoreAssetRequistionItemsById(reqId: number) {
    return this.http.get<any>("/api/WardSupplyAssets/GetSubstoreAssetRequistionItemsById/" + reqId, this.options);
  }

  public GetWardInventoryReturnItemsByReturnId(returnId: number) {
    return this.http.get<any>("/api/WardSupply/GetWardInventoryReturnItemsByReturnId/" + returnId, this.options);
  }
  //GET: get ward list.

  public GetInventoryList() {
    return this.http.get<any>("/api/ActivateInventory/", this.options);
  }
  // GET: Consumption Details 

  //GET: Inventory Consumption List


  //GET: All Ward Request List

  //GET: ward req Items List


  //GET: Consumption Items List

  //GET: Inventory Consumption Item List


  //GET:Internal Consumption Item List

  //GET:Internal Consumption Item Details
  //get phrm stock list
  GetItemTypeListWithItems() {
    return this.http.get<any>("/api/WardSupply/GetPharmacyItemToRequest", this.options);
  }
  //GET:patient List from Patient controller

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
    return this.http.get("/api/WardSupply/RequisitionDispatchReport/"
      + wardReports.FromDate + "/" + wardReports.ToDate + "/" + wardReports.StoreId, this.options)
  }

  ////GET: Get Transfer Report
  public GetTransferReport(wardReports) {
    return this.http.get<any>("/api/WardSupply/Inventory/Reports/TransferReport/"
      + wardReports.FromDate + "/" + wardReports.ToDate + "/" + wardReports.StoreId, this.options)
  }

  ////GET: Get Transfer Report
  public GetConsumptionReport(wardReports) {
    return this.http.get("/api/WardSupply/ConsumptionReport/"
      + wardReports.FromDate + "/" + wardReports.ToDate + "/" + wardReports.StoreId, this.options)
  }

  public GetDispatchDetails(RequisitionId: number) {
    return this.http.get<any>('/api/WardSupplyAssets/dispatchview/' + RequisitionId, this.options);
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
    return this.http.post<any>(this.baseApiUrl + "/InternalConsumption", data, this.options)
  }
  //post consumption data
  PostInventoryConsumptionData(consumptiondata) {
    let data = JSON.stringify(consumptiondata);
    return this.http.post<any>(this.baseApiUrl + "/InventoryConsumption", data, this.options);
  }
  //Post to Stock table and post to Transaction table 
  PostManagedStockDetails(data, ReceivedBy) {
    try {
      return this.http.post<any>("/api/WardSupply/TransferStock/" + ReceivedBy, data, this.optionsJson);
    }
    catch (ex) {
      throw ex;
    }
  }
  //Post to Stock table and post to Transaction table
  PostInventoryStockTransfer(data) {
    try {
      return this.http.post<any>(`${this.baseApiUrl}/TransferInventoryStock`, data, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  //Post to Stock table and post to Transaction table
  PostBackToInventory(data) {
    try {
      return this.http.post<any>(`${this.baseApiUrl}/TransferBackToInventory`, data, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  //Post to Stock table and Transaction table for breakage items
  PostBreakageStockDetails(data) {
    try {
      return this.http.post<any>(`${this.baseApiUrl}/BreakageStock`, data, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }

  //GET: Get CapitalGoodsItemList
  public GetCapitalGoodsItemList() {
    return this.http.get<any>('/api/WardSupplyAssets/GetCapitalGoodsItemList/', this.options);
  }

  //Posting the  Requisiton and requisitionItems table FixedAssetRequisition/FixedAssetRequisitionItems
  public PostToAssetRequisition(RequisitionObjString: string) {
    let data = RequisitionObjString;
    return this.http.post<any>("/api/WardSupplyAssets/AssetRequisition", data, this.options);
  }
  //swapnil-2-april-2021
  //Posting the  Return and returnItems table FixedAssetReturn/FixedAssetReturnItems
  public PostToAssetReturn(ReturnObjString: string) {
    let data = ReturnObjString;
    return this.http.post<any>("/api/WardSupplyAssets?reqType=AssetReturn", data, this.options);
  }
  public PostToWardInventoryReturn(ReturnObjString: string) {
    let data = ReturnObjString;
    return this.http.post<any>("/api/WardSupply/WardInventoryReturn", data, this.options);
  }


  //GET: Requisition List
  public GetSubstoreAssetRequistionList(fromDate: string, toDate: string, subStoreId: number) {
    return this.http.get<any>('/api/WardSupplyAssets/GetSubstoreAssetRequistionList/' + fromDate + '/' + toDate + '/' + subStoreId, this.optionsJson);
  }
  public GetSubstoreAssetReturnList(fromDate: string, toDate: string, subStoreId: number) {
    return this.http.get<any>('/api/WardSupplyAssets/GetSubstoreAssetReturnList/' + fromDate + '/' + toDate + '/' + subStoreId, this.optionsJson);
  }
  public GetWardInventoryReturnList(fromDate: string, toDate: string, subStoreId: number) {
    return this.http.get<any>('/api/WardSupply/GetWardInventoryReturnList/' + fromDate + '/' + toDate + '/' + subStoreId, this.optionsJson);
  }

  //post ward stock to Pharmacy
  public PostReturnStock(data, ReceivedBy) {
    return this.http.post<any>("/api/WardSupply/ReturnStockToPharmacy/" + ReceivedBy, data, this.optionsJson);
  }
  //Put Consumption Item List
  PutConsumptionData(consumptiondata) {
    let data = JSON.stringify(consumptiondata);
    return this.http.put<any>("/api/WardSupply/PatientConsumption", data, this.options);
  }
  //Put Internal Consumption Item List
  PutInternalConsumptionData(internalconsumptiondata) {
    let data = JSON.stringify(internalconsumptiondata);
    return this.http.put<any>("/api/WardSupply/InternalConsumption", data, this.options);
  }

  //PUT UpdateDispatchReceiveStatus
  PutUpdateDispatchedItemsReceiveStatus(dispatchId, receivedRemarks) {
    return this.http.put<any>("/api/WardSupply/UpdateDispatchedItemsReceiveStatus/" + dispatchId, receivedRemarks, this.optionsJson);
  }
  //PUT UpdateRequisition
  PutUpdateRequisition(requisition: string) {
    let data = requisition;
    return this.http.put<any>("/api/WardSupply/UpdateRequisition", data, this.optionsJson);
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
    return this.http.get<any>("/api/Patient/PatientWithVisitInfo?search=" + searchTxt, this.options);
  }

  PostInventoryPatConsumptionData(consumptiondata) {
    let data = JSON.stringify(consumptiondata);
    return this.http.post<any>("/api/WardSupply/PostInvPatientConsumption", data);
  }




  public GetInventoryPatientComsumptionReceiptList(storeId, fromDate, toDate) {
    return this.http.get<any>("/api/WardSupply/GetInventoryPatientConsumptionReceiptList/" + storeId + "/" + fromDate + "/" + toDate, this.options);
  }


  //GET:patient List from Patient controller
  public GetFixedAssetDispatchListForItemReceive(RequisitionId) {
    return this.http.get<any>("/api/WardSupply/GetFixedAssetDispatchListForItemReceive/" + RequisitionId, this.options);
  }

  UpdateReconciledStockFromExcelFile(data: any) {
    try {
      return this.http.post<any>("/api/WardSupply/UpdateReconciledStockFromExcelFile", data, this.options);
    } catch (ex) {
      throw ex;
    }
  }

  ExportStocksForReconciliationToExcel(StoreId: number) {
    return this.http.get(`/api/WardSupply/ExportStocksForReconciliationToExcel?StoreId=${StoreId}`, { responseType: 'blob' });
  }
  public GetItemCategory() {
    return this.http.get<any>("/api/WardSupply/GetItemSubCategory");
  }
  AddRequisition(data: any) {
    return this.http.post<any>(`/api/WardSupply/PostPhrmSubStoreRequisition`, data);
  }
  GetRequisitionView(requisitionId) {
    return this.http.get<any>(`/api/DispensaryRequisition/${requisitionId}`);
  }
  CancelRequisitionItems(requisition: any) {
    return this.http.put(`/api/DispensaryRequisition/CancelRequisitionItems`, requisition, this.optionsJson);
  }

  GetDispatchedItemToReceive(RequisitionId: number) {
    return this.http.get(`/api/WardSupply/GetDispatchedItemToReceive?requisitionId=${RequisitionId}`);
  }

  ReceiveDispatchedItem(DispatchId: number, ReceivedRemarks: string) {
    return this.http.put<any>(`/api/DispensaryRequisition/ReceiveDispatchedItems/${DispatchId}`, ReceivedRemarks, this.optionsJson);
  }

  GetPHRMSubStoreAvailableStockByStoreId(StoreId: number) {
    return this.http.get(`/api/WardSupply/GetPHRMSubStoreAvailableStockByStoreId/${StoreId}`);
  }

  GetVerifiers() {
    return this.http.get(`/api/WardSupply/Verifiers`);
  }
}

