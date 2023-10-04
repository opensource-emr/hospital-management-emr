import { Injectable, Directive } from '@angular/core';
import * as _ from 'lodash';
import { RequisitionForDispatchModel } from '../assets-substore-requisition-dispatch/assets-substore-requisition-dispatch-model';
import { FixedAssetDispatch } from './fixed-asset-dispatch.model'; //swapnil-2-april-2021 

import { FixedAssetDLService } from './fixed-asset.dl.service';
@Injectable()
export class FixedAssetBLService {

  constructor(public fixedAssetDLService: FixedAssetDLService) {

  }
  public GetAllEmployeeList() {
    return this.fixedAssetDLService.GetAllEmployeeList();
  }
  public GetAllDepartments() {
    return this.fixedAssetDLService.GetAllDepartments();
  }
  public GetAllItems() {
    return this.fixedAssetDLService.GetAllItems();
  }
  public ShowFixedAssetsMovement(obj) {
    return this.fixedAssetDLService.GetFixedAssetsMovementReportData(obj);
  }

  public GetMaintenanceVendorDetails(vendorId) {
    return this.fixedAssetDLService.GetMaintenanceVendorDetails(vendorId)
      .map(res => { return res })
  }

  //GET:FaultHistoryDetsils
  public GetFaultHistoryDetsils(fixedAssetStockId) {
    return this.fixedAssetDLService.GetFaultHistoryDetsils(fixedAssetStockId)
      .map(res => { return res })
  }


  //GET: External : get all  fixed asset location list
  public GetFixedAssetLocationList() {
    return this.fixedAssetDLService.GetFixedAssetLocationList()
      .map(res => { return res });
  }

  //GET: External : get all  fixed asset donation list
  // public GetFixedAssetDonationList() {
  //   return this.fixedAssetDLService.GetFixedAssetDonationList()
  //     .map(res => { return res });
  // }


  public GetAssetsMaintenanceList() {
    return this.fixedAssetDLService.GetAssetsMaintenanceList()
      .map(res => { return res });
  }

  public GetAssetsConditionCheckList(fixedAssetStockId) {
    return this.fixedAssetDLService.GetAssetsConditionCheckList(fixedAssetStockId)
      .map(res => { return res });
  }
  public GetSubstoreAssetRequistionList(fromDate, toDate, StoreId) {
    return this.fixedAssetDLService.GetSubstoreAssetRequistionList(fromDate, toDate, StoreId)
      .map(res => { return res });
  }
  UpdateFixedAssetStocList(selectedAssetForEdit) {
    let newAsset: any = _.omit(selectedAssetForEdit, ['FAStockValidators', 'FAEditAssetValidators', 'FAEditAssetMainteanceValidators']);
    let data = JSON.stringify(newAsset);
    return this.fixedAssetDLService.UpdateFixedAssetStocList(data)
      .map(res => { return res })

  }
  //PUT:update AssetsMaintenance
  UpdateAssetMaintenanceFixedAssetStocList(selectedAssetForEdit) {
    let newAsetmaintence: any = _.omit(selectedAssetForEdit, ['FAStockValidators', 'FAEditAssetValidators', 'FAEditAssetMainteanceValidators']);
    let data = JSON.stringify(newAsetmaintence);
    return this.fixedAssetDLService.UpdateAssetMaintenanceFixedAssetStocList(data)
      .map(res => { return res })

  }
  ConfirmFaultUpdate(assetFaultUpsate) {
    let data = JSON.stringify(assetFaultUpsate);
    return this.fixedAssetDLService.ConfirmFaultUpdate(data)
      .map(res => { return res })

  }


  //Post: Assets Check List
  PostAssetCheckList(allCheckList) {
    let data = JSON.stringify(allCheckList);
    return this.fixedAssetDLService.PostAssetCheckList(data)
      .map(res => { return res })

  }

  //PUT:Update fault page
  EditFaultUpdate(assetFaultUpdate) {
    let data = JSON.stringify(assetFaultUpdate);
    return this.fixedAssetDLService.EditFaultUpdate(data)
      .map(res => { return res })

  }

  // Update Asset damage status
  UpdateAssetDamageStatus(selectedAsset) {
    let omitted: any = _.omit(selectedAsset, ['FAStockValidators', 'FAEditAssetValidators', 'FAEditAssetMainteanceValidators']);

    let data = JSON.stringify(omitted);
    return this.fixedAssetDLService.UpdateAssetDamageStatus(data)
      .map(res => { return res })
  }
  // getting contract file of Asset
  GetAssetContract(FixedAssetStockId) {
    //let data = JSON.stringify(formData);
    return this.fixedAssetDLService.GetAssetContract(FixedAssetStockId)
      .map(res => { return res })
  }
  public GetAssetsGoodsReceiptList() {
    return this.fixedAssetDLService.GetAssetsGoodsReceiptList()
      .map(res => { return res });
  }
  // Post Fixed Asset Contract
  PostAssetContract(formData) {
    //let data = JSON.stringify(formData);
    return this.fixedAssetDLService.PostAssetContract(formData)
      .map(res => { return res })
  }
  PutAssetContract(formData) {
    return this.fixedAssetDLService.PutAssetContract(formData)
      .map(res => { return res })
  }
  public GetAssetsDepreciationList() {
    return this.fixedAssetDLService.GetAssetsDepreciationList()
      .map(res => { return res });
  }

  public PostAssetInsurance(data) {
    let omitted: any = _.omit(data, ['InsuranceValidators', 'FAEditAssetValidators', 'FAEditAssetMainteanceValidators']);
    return this.fixedAssetDLService.PostAssetInsurance(omitted)
      .map(res => { return res });
  }
  public GetAssetInsurance(FixedAssetStockId) {
    return this.fixedAssetDLService.GetAssetInsurance(FixedAssetStockId)
      .map(res => { return res });
  }

  public PutAssetInsurance(data) {
    let omitted: any = _.omit(data, ['InsuranceValidators', 'FAEditAssetValidators', 'FAEditAssetMainteanceValidators']);
    return this.fixedAssetDLService.PutAssetInsurance(omitted)
      .map(res => { return res });
  }

  public GetAssetDepreciationDetails(fixedAssetId) {
    return this.fixedAssetDLService.GetAssetDepreciationDetails(fixedAssetId)
      .map(res => { return res });
  }

  public PostAssetDepreciationDetails(data) {
    let omitted: any = _.omit(data, ['DepreciationValidators']);
    return this.fixedAssetDLService.PostAssetDepreciationDetails(omitted)
      .map(res => { return res });
  }
  public PutAssetDepreciationDetails(data) {
    let omitted: any = _.omit(data, ['DepreciationValidators']);
    return this.fixedAssetDLService.PutAssetDepreciationDetails(omitted)
      .map(res => { return res });
  }
  public GetAssetDepreciationMethods() {
    return this.fixedAssetDLService.GetAssetDepreciationMethods()
      .map(res => { return res });
  }

  public PutAssetRequiredMaintenance(data) {
    let omitted: any = _.omit(data, ['FAStockValidators', 'FAEditAssetValidators', 'FAEditAssetMainteanceValidators']);
    return this.fixedAssetDLService.PutAssetRequiredMaintenance(omitted)
      .map(res => { return res });
  }

  public UpdateAssetScrapDetails(selectedAsset) {
    let omitted: any = _.omit(selectedAsset, ['FAStockValidators', 'FAEditAssetValidators', 'FAEditAssetMainteanceValidators']);

    let data = JSON.stringify(omitted);
    return this.fixedAssetDLService.UpdateAssetScrapDetails(data)
      .map(res => { return res })
  }
  public PutAssetDamageConfirmation(data) {
    let omitted: any = _.omit(data, ['FAStockValidators', 'FAEditAssetValidators', 'FAEditAssetMainteanceValidators']);
    return this.fixedAssetDLService.PutAssetDamageConfirmation(omitted)
      .map(res => { return res });
  }
  public PutAssetFaultResolvedDetails(data) {
    return this.fixedAssetDLService.PutAssetFaultResolvedDetails(data)
      .map(res => { return res });
  }
  public PutRepairStatus(data) {
    let omitted: any = _.omit(data, ['FAStockValidators', 'FAEditAssetMainteanceValidators', 'FAEditAssetMainteanceValidators']);
    return this.fixedAssetDLService.PutRepairStatus(omitted)
      .map(res => { return res });
  }
  //POST: Posting Dispatched Items
  PostdirectDispatch(dispatch: FixedAssetDispatch) {

    //omiting the validators during post because it causes cyclic error during serialization in server side.
    //omit validator from inputPO (this will give us object)
    let newdes: any = _.omit(dispatch, ['RequisitionValidator']);
    let newdesItems = dispatch.DispatchItems.map(item => {
      return _.omit(item, ['RequisitionItemValidator']);
    });

    newdes.DispatchItems = newdesItems;

    let data = JSON.stringify(newdes);
    return this.fixedAssetDLService.PostdirectDispatch(data).map(res => { return res })
  }

  public GetAssetServiceHistory(assetId) {
    return this.fixedAssetDLService.GetAssetServiceHistory(assetId)
      .map(res => { return res });
  }

  public PostAssetServiceDetails(data) {
    let omitted: any = _.omit(data, ['AssetServiceValidators']);
    return this.fixedAssetDLService.PostAssetServiceDetails(omitted)
      .map(res => { return res });
  }
  public PutAssetServiceDetails(data) {
    let omitted: any = _.omit(data, ['AssetServiceValidators']);
    return this.fixedAssetDLService.PutAssetServiceDetails(omitted)
      .map(res => { return res });
  }

  GetAllInventoryFiscalYears() {
    return this.fixedAssetDLService.GetAllInventoryFiscalYears()
      .map(res => { return res });
  }
  //GET:Get All Requision with Requisition Items for Dispatch purpose
  GetRequisitionDetailsForDispatch(RequisitionId: number) {

    return this.fixedAssetDLService.GetRequisitionDetailsForDispatch(RequisitionId)
      .map((responseData) => {
        return responseData;
      });
  }
  //POST: Posting Dispatched Items
  PostDispatch(dispatchItems: FixedAssetDispatch) {
    //omiting the validators during post because it causes cyclic error during serialization in server side.
    //omit validator from inputPO (this will give us object)
    let newdisp: any = _.omit(dispatchItems, ['RequisitionValidator']);
    let newdispatchItems = dispatchItems.DispatchItems.map(item => {
      return _.omit(item, ['RequisitionItemValidator']);
    });
    newdisp.DispatchItems = newdispatchItems;
    let data = JSON.stringify(newdisp);
    return this.fixedAssetDLService.PostDispatch(data)
      .map(res => { return res })

  }
  //get substore asset requisition items by requisition id
  public GetSubstoreAssetRequistionItemsById(reqId: number) {
    return this.fixedAssetDLService.GetSubstoreAssetRequistionItemsById(reqId)
      .map(res => { return res });
  }

  // get substore list.
  public GetActiveSubStoreList() {
    return this.fixedAssetDLService.GetActiveSubStoreList()
      .map(res => { return res });
  }

  public GetFixedAssetStockByStoreId(storeId: number) {
    try {
      return this.fixedAssetDLService.GetFixedAssetStockByStoreId(storeId)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }
  GetDispatchDetails(RequisitionId: number) {
    return this.fixedAssetDLService.GetDispatchDetails(RequisitionId)
      .map((responseData) => {
        return responseData;
      });
  }

  GetDispatchDetailsbyDispatchId(DispatchId: number) {
    return this.fixedAssetDLService.GetDispatchDetailsbyDispatchId(DispatchId)
      .map((responseData) => {
        return responseData;
      });
  }
}

