import { Injectable, Directive } from '@angular/core';
import * as _ from 'lodash';
import * as moment from 'moment/moment';

import { WardSupplyDLService } from './wardsupply.dl.service';
import { WardRequisitionModel } from './ward-requisition.model';
import { WardStockModel } from './ward-stock.model';
import { WARDReportsModel } from './ward-report.model';


@Injectable()
export class WardSupplyBLService {
  WardSupplyDLService: any;

  constructor(public wardSplDLservice: WardSupplyDLService) {

  }
  // GET: Stock Details 
  public GetAllWardItemsStockDetailsList() {

    try {
      return this.wardSplDLservice.GetAllWardItemsStockDetailsList()
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }
  public GetInventoryStockDetailsList() {

    try {
      return this.wardSplDLservice.GetWardInventoryStockDetailsList()
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }
  // get ward list.
  public GetWardList() {
    return this.wardSplDLservice.WardList()
      .map(res => { return res });
  }

  // Get Consumption Details list.
  public GetAllComsumptionListDetails(wardId) {
    return this.wardSplDLservice.GetAllComsumptionListDetails(wardId)
      .map(res => { return res });
  }
  //Get Inventory Consumption Details List
  public GetInventoryConsumptionListDetails(departmentId) {
    return this.wardSplDLservice.GetInventoryComsumptionListDetails(departmentId)
      .map(res => { return res });
  }

  // get ward resuistion list.
  public GetWardRequisitionList(status: string, wardId: number) {
    return this.wardSplDLservice.GetWardRequisitionList(status, wardId)
      .map(res => { return res });
  }

  //GET: To get ward Items List.
  public GetWardReqItemList(requisitionID) {
    return this.wardSplDLservice.GetWardReqItemList(requisitionID)
      .map(res => { return res });
  }
  public GetDepartments() {
    return this.wardSplDLservice.GetDepartments()
      .map((responseData) => {
        return responseData;
      });
  }
  //GET: To get Consumption Items List.
  public GetConsumptionItemList(patientId, wardId) {
    return this.wardSplDLservice.GetConsumptionItemList(patientId, wardId)
      .map(res => { return res });
  }
  //Get: To get Inventory Consumption Items List.
  public GetInventoryConsumptionItemList(userName, departmentId) {
    return this.wardSplDLservice.GetInventoryConsumptionItemList(userName, departmentId)
      .map(res => { return res });
  }
  //get phrm stock list
  GetItemTypeListWithItems() {
    return this.wardSplDLservice.GetItemTypeListWithItems()
      .map(res => { return res });
  }

  //get ward stock list
  GetWardStockList() {
    return this.wardSplDLservice.GetWardStockList()
      .map(res => { return res });
  }

  //GET: Patient List
  public GetPatients() {
    return this.wardSplDLservice.GetPatients()
      .map(res => { return res })
  }
  //Get: Ward Stock Report
  public GetStockItemsReport(itemId) {
    try {
      return this.wardSplDLservice.GetStockItemsReport(itemId)
        .map(res => { return res });
    }
    catch (ex) {
      throw ex;
    }
  }

  //Get: Ward Requisition Report
  public GetWardRequsitionReport(wardReports: WARDReportsModel) {
    return this.wardSplDLservice.GetWardRequsitionReport(wardReports)
      .map((responseData) => {
        return responseData;
      });
  }

  //Get: Ward Breakage Report
  public GetWardBreakageReport(wardReports: WARDReportsModel) {
    return this.wardSplDLservice.GetWardBreakageReport(wardReports)
      .map((responseData) => {
        return responseData;
      });
  }


  //Get: Ward Consumpiton Report
  public GetWardConsumptionReport(wardReports: WARDReportsModel) {
    return this.wardSplDLservice.GetWardConsumptionReport(wardReports)
      .map((responseData) => {
        return responseData;
      });
  }

  //Get: Ward Transfer Report
  public GetWardTransferReport(wardReports: WARDReportsModel) {
    return this.wardSplDLservice.GetWardTransferReport(wardReports)
      .map((responseData) => {
        return responseData;
      });
  }

  //Ward Inventory Reports
  //Get: Requisition and Dispatch Report
  public GetRequisitionDispatchReport(wardReports: WARDReportsModel) {  
    return this.wardSplDLservice.GetRequisitionDispatchReport(wardReports)
      .map((responseData) => {
        return responseData;
      });
  }

  //Get: Transfer Report
  public GetTransferReport(wardReports: WARDReportsModel) {
    return this.wardSplDLservice.GetTransferReport(wardReports)
      .map((responseData) => {
        return responseData;
      });
  }

  //Get: Transfer Report
  public GetConsumptionReport(wardReports: WARDReportsModel) {
    return this.wardSplDLservice.GetConsumptionReport(wardReports)
      .map((responseData) => {
        return responseData;
      });
  }

  //POST
  PostConsumptionData(data) {
    let temp = data.map(a => {
      return _.omit(a, ['ConsumptionValidator', 'SelectedItem', 'selectedPatient']);
    });
    return this.wardSplDLservice.PostConsumptionData(temp)
      .map(res => { return res });
  }
  //POST Inventory Consumption Data
  PostInventoryConsumptionData(data) {
    let temp = data.map(a => {
      return _.omit(a, ['ConsumptionValidator', 'SelectedItem', 'selectedPatient']);
    });
    return this.wardSplDLservice.PostInventoryConsumptionData(temp)
      .map(res => { return res });
  }

  //Post to Stock table and post to Transaction table 
  PostManagedStockDetails(selectedData) {
    try {
      let newItem: any = _.omit(selectedData, ['StockManageValidator']);
      let data = JSON.stringify(newItem);
      return this.wardSplDLservice.PostManagedStockDetails(data)
        .map(res => { return res });
    } catch (ex) {
      throw ex;
    }
  }
  //Post Inventory stock from one department to another.
  PostInventoryStockTransfer(selectedData) {
    try {
      let newItem: any = _.omit(selectedData, ['StockManageValidator']);
      let data = JSON.stringify(newItem);
      return this.wardSplDLservice.PostInventoryStockTransfer(data)
        .map(res => { return res });
    } catch (ex) {
      throw ex;
    }
  }
  //Post ward supply stock back to inventory
  PostBackToInventory(selectedData) {
    try {
      let newItem: any = _.omit(selectedData, ['StockManageValidator']);
      let data = JSON.stringify(newItem);
      return this.wardSplDLservice.PostBackToInventory(data)
        .map(res => { return res });
    } catch (ex) {
      throw ex;
    }
  }
  //Post to Stock table and Transaction table for breakage items
  PostBreakageStockDetails(selectedData) {
    try {
      let newItem: any = _.omit(selectedData, ['StockManageValidator']);
      let data = JSON.stringify(newItem);
      return this.wardSplDLservice.PostBreakageStockDetails(data)
        .map(res => { return res });
    } catch (ex) {
      throw ex;
    }
  }

  //Post Ward Requisition
  public PostWardRequisition(wardReq: WardRequisitionModel) {
    try {
      let newWardReq: any = _.omit(wardReq);
      let newWardReqItems = wardReq.WardRequisitionItemsList.map(item => {
        return _.omit(item, ['positiveNumberValdiator', 'WardRequestValidator', 'positiveNumberValdiatortest', 'WardRequestValidatortest']);
      });
      newWardReq.WardRequisitionItemsList = newWardReqItems;
      let data = JSON.stringify(newWardReq);
      return this.wardSplDLservice.PostWardRequisition(data)
        .map((res) => { return res });
    }

    catch (ex) {
      throw ex;
    }
  }
  //post ward stock to pharmacy
  public PostReturnStock(stockItems: Array<WardStockModel>) {
    let StockItems = stockItems.map(item => {
      return _.omit(item, ['StockManageValidator', 'positiveNumberValdiator'])
    })
    let data = JSON.stringify(StockItems);
    return this.wardSplDLservice.PostReturnStock(data)
      .map((res) => { return res });
  }
}
