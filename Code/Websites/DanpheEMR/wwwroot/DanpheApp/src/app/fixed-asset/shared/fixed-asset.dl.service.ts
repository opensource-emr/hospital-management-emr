import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ActivateInventoryService } from '../../shared/activate-inventory/activate-inventory.service';


@Injectable()
export class FixedAssetDLService {
  managementBaseUrl = '/api/AssetManagement';
  maintenanceBaseUrl = '/api/AssetMaintenance';
  reportBaseUrl = '/api/AssetReports';
  deprnDiscardingBaseUrl = '/api/AssetDepreciationDiscarding';
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  public optionsJson = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(public http: HttpClient, private _activateInventoryService: ActivateInventoryService) {

  }

  public GetAllEmployeeList() {
    return this.http.get<any>(this.reportBaseUrl + "/GetAllEmployeeList");
  }
  public GetAllDepartments() {
    return this.http.get<any>(this.reportBaseUrl + "/GetAllDepartments");
  }
  public GetAllItems() {
    return this.http.get<any>(this.reportBaseUrl + "/GetAllItems");
  }
  public GetFixedAssetsMovementReportData(obj:any) {
    return this.http.get<any>("/InventoryReports/FixedAssetsMovementReport?FromDate=" + obj.FromDate + "&ToDate=" + obj.ToDate + "&EmployeeId=" + obj.EmployeeId + "&DepartmentId=" + obj.DepartmentId + "&ItemId=" + obj.ItemId + "&ReferenceNumber=" + obj.ReferenceNumber);
  }

  //GET: External : get all goods receipt list
  public GetAssetsGoodsReceiptList() {
    return this.http.get<any>(`${this.managementBaseUrl}/${this._activateInventoryService.activeInventory.StoreId}`);
  }

  public GetAssetInsurance(FixedAssetStockId) {
    return this.http.get<any>(`${this.managementBaseUrl}/GetAssetInsurance/${FixedAssetStockId}`);
  }
  public PostAssetInsurance(data) {
    return this.http.post<any>(`${this.managementBaseUrl}/PostAssetInsurance`, data);
  }
  public PutAssetInsurance(data) {
    return this.http.put<any>(`${this.managementBaseUrl}/PutAssetInsurance`, data);
  }

  public PutAssetDamageConfirmation(data) {
    return this.http.put<any>(`${this.managementBaseUrl}/PutAssetDamageConfirmation`, data);
  }

  //PUT:Update FixedAssetStocList
  public UpdateFixedAssetStocList(selectedAssetForEdit) {
    let data = selectedAssetForEdit;
    return this.http.put<any>(this.managementBaseUrl + "/UpdateAssetManagementList", data)
  }




  public GetAssetsMaintenanceList() {
    return this.http.get<any>(`${this.maintenanceBaseUrl}/${this._activateInventoryService.activeInventory.StoreId}`);
  }


  public GetMaintenanceVendorDetails(vendorId) {
    return this.http.get<any>(`${this.maintenanceBaseUrl}/Vendor/${vendorId}`);
  }

  //GET: Fault History Data
  public GetFaultHistoryDetsils(fixedAssetStockId) {
    return this.http.get<any>(`${this.maintenanceBaseUrl}/getfaulthistory/${fixedAssetStockId}`);
  }

  // //GET: External : get all  fixed asset location list
  public GetFixedAssetLocationList() {
    return this.http.get<any>(`${this.maintenanceBaseUrl}/GetFixedAssetLocations`);
  }

  //GET: External : get all  fixed asset donation list
  // public GetFixedAssetDonationList() {
  //   return this.http.get<any>("/api/inventory/GetFixedAssetDonation");
  // }

  //GET: External : get all  CheckList
  public GetAssetsConditionCheckList(fixedAssetStockId) {
    return this.http.get<any>(`${this.maintenanceBaseUrl}/AssestConditionChecklist/${fixedAssetStockId}`);
  }
  public GetSubstoreAssetRequistionList(fromDate: string, toDate: string, StoreId: number) {
    return this.http.get<any>('/api/WardSupplyAssets/GetSubstoreAssetRequistionListByStoreId/' + fromDate + '/' + toDate + '/' + StoreId, this.optionsJson);
  }
  // public GetFixedAssetStocList(FixedAssetStockId) {
  //   return this.http.get<any>("/api/inventory?reqType=FixedAssetStockByFiexdId&FixedAssetStockId=" + FixedAssetStockId, this.options);
  // }

  UpdateAssetMaintenanceFixedAssetStocList(selectedAssetForEdit) {
    let data = selectedAssetForEdit;
    return this.http.put<any>(`${this.maintenanceBaseUrl}/UpdateAssetMaintenanceList`, data)
  }

  ConfirmFaultUpdate(assetFaultUpsate) {
    let data = assetFaultUpsate;
    return this.http.post<any>(`${this.maintenanceBaseUrl}/AssetFaultConfirm`, data)
  }

  //Post: Assets Check List
  PostAssetCheckList(allCheckList) {
    let data = allCheckList;
    return this.http.post<any>(`${this.maintenanceBaseUrl}/AssetCheckList`, data)
  }

  //PUT:Update fault page
  public EditFaultUpdate(assetFaultUpdate) {
    let data = assetFaultUpdate;
    return this.http.put<any>(`${this.maintenanceBaseUrl}/AssetFaultUpdate`, data)
  }

  public UpdateAssetDamageStatus(data) {
    return this.http.put<any>(`${this.maintenanceBaseUrl}/UpdateAssetDamageStatus`, data);

  }

  public GetAssetContract(FixedAssetStockId) {
    return this.http.get<any>(this.maintenanceBaseUrl + "/GetAssetContractFile/" + FixedAssetStockId);
  }

  public PostAssetContract(formData) {
    return this.http.post<any>(`${this.maintenanceBaseUrl}/PostAssetContractFile`, formData);

  }
  public PutAssetContract(formData) {
    return this.http.put<any>(`${this.maintenanceBaseUrl}/PutAssetContractFile`, formData);
  }

  public GetAssetServiceHistory(assetId) {
    return this.http.get<any>(`${this.maintenanceBaseUrl}/GetAssetServiceHistory/${assetId}`);
  }

  public PutAssetServiceDetails(data) {
    return this.http.put<any>(`${this.maintenanceBaseUrl}/PutAssetServiceDetails`, data);
  }

  public PostAssetServiceDetails(data) {
    return this.http.post<any>(`${this.maintenanceBaseUrl}/PostAssetServiceDetails`, data);
  }

  public PutAssetRequiredMaintenance(data) {
    return this.http.put<any>(`${this.maintenanceBaseUrl}/PutAssetRequiredMaintenance`, data);
  }

  public PutAssetFaultResolvedDetails(data) {
    return this.http.put<any>(this.maintenanceBaseUrl + "/PutAssetFaultResolvedDetails", data);
  }

  public PutRepairStatus(data) {
    return this.http.put<any>(`${this.maintenanceBaseUrl}/PutRepairStatus`, data);
  }









  public GetAssetsDepreciationList() {
    return this.http.get<any>(`${this.deprnDiscardingBaseUrl}/${this._activateInventoryService.activeInventory.StoreId}`);
  }

  public GetAssetDepreciationDetails(FixedAssetStockId) {
    return this.http.get<any>(`${this.deprnDiscardingBaseUrl}/depreciationDetailsById/${FixedAssetStockId}`);
  }

  public PostAssetDepreciationDetails(data) {
    return this.http.post<any>(`${this.deprnDiscardingBaseUrl}/PostAssetDepreciation`, data);
  }

  public PutAssetDepreciationDetails(data) {
    return this.http.put<any>(`${this.deprnDiscardingBaseUrl}/PutAssetDepreciation`, data);
  }
  public GetAssetDepreciationMethods() {
    return this.http.get<any>(`${this.deprnDiscardingBaseUrl}/GetAssetDepreciationMethods`);
  }

  public UpdateAssetScrapDetails(data) {
    return this.http.put<any>(`${this.deprnDiscardingBaseUrl}/UpdateAssetScrapDetails`, data);
  }

  public GetAllInventoryFiscalYears() {
    return this.http.get<any>(`${this.managementBaseUrl}/GetAllInventoryFiscalYears`);
  }
  //start-swapnil-2-april-2021 
  //POST Direct Dispatch
  public PostDirectDispatch(dispatchItems: any[]) {
    let data = JSON.stringify(dispatchItems);
    //return this.http.post<any>("/api/Pharmacy/PostDirectDispatch", data);
    return this.http.post<any>(`${this.deprnDiscardingBaseUrl}/PostDirectDispatch`, data);
    //return this.http.post<any>("/api/Pharmacy/PostDirectDispatch", data, this.optionJson);
  }
  //Get : all the main store stock
  public GetMainStoreStock() {
    //return this.http.get<any>("/api/Pharmacy/GetMainStoreStock");
    return this.http.get<any>(this.managementBaseUrl);
  }
  //GET: Get Requisition and Requisition Items with Stock Records for Dispatch Items
  public GetRequisitionDetailsForDispatch(RequisitionId: number) {
    return this.http.get<any>('/api/WardSupplyAssets/GetRequisitionDetailsForDispatch/' + RequisitionId, this.optionsJson);
    //return this.http.get<any>("/api/Pharmacy/GetRequisitionDetailsForDispatch/" + RequisitionId, this.options);
  }
  //POST:Save dispatched Items to database
  public PostDispatch(dispatchItems) {
    return this.http.post<any>("/api/WardSupplyAssets/PostStoreDispatch", dispatchItems, this.optionsJson);
  }
  //POST:Save dispatched Items to database
  public PostdirectDispatch(dispatchdataFromClient) {
    return this.http.post<any>("/api/WardSupplyAssets/PostDirectDispatch", dispatchdataFromClient, this.optionsJson);
  }
  //end-swapnil-2-april-2021 
  public GetSubstoreAssetRequistionItemsById(reqId: number) {
    return this.http.get<any>("/api/WardSupplyAssets/GetSubstoreAssetRequistionItemsById/" + reqId, this.options);
  }

  //GET: get substore list.
  public GetActiveSubStoreList() {
    return this.http.get<any>("/api/WardSupply?reqType=active-substore-list", this.options);
  }
  public GetFixedAssetStockByStoreId(StoreId: number) {
    return this.http.get<any>("/api/WardSupplyAssets/GetFixedAssetStockByStoreId/" + StoreId, this.options);
  }
  //GET
  public GetDispatchDetails(RequisitionId: number) {
    return this.http.get<any>('/api/WardSupplyAssets/dispatchview/' + RequisitionId, this.options);
  }
  public GetDispatchDetailsbyDispatchId(DispatchId: number) {
    return this.http.get<any>('/api/WardSupplyAssets/dispatchviewbyDispatchId/' + DispatchId, this.options);
  }

}
