import { Injectable, Directive } from '@angular/core';
import * as _ from 'lodash';

import { PurchaseOrder } from "./purchase-order.model";
import { PurchaseOrderItems } from "./purchase-order-items.model"
import { DispatchItems } from "./dispatch-items.model"
import { GoodsReceipt } from "../shared/goods-receipt.model"
import { Requisition } from "../shared/requisition.model"
import { ReturnToVendorItem } from "../shared/return-to-vendor-items.model";
import { RequisitionStockVMModel } from "../shared/requisition-stock-vm.model"
import { WriteOffItems } from "../shared/write-off-items.model"
import { StockModel } from "../shared/stock.model";
import { RequisitionsStockVMModel } from "../shared/requisitions-stock-vm.model";

import { InventoryDLService } from "./inventory.dl.service"
import { RequestForQuotationModel } from './request-for-quotaion.model';
import { QuotationModel } from './quotation.model';

import * as moment from 'moment/moment';
import { QuotationItemsModel } from './quotation-items.model';
import { QuotationUpLoadFileModel } from './quotation-upload-file.model';
@Injectable()
export class InventoryBLService {
  public PurchaseOrderItems: PurchaseOrderItems = null;

  constructor(public inventoryDLService: InventoryDLService) {

  }

  public getQuotationBySelected(ReqForQuotationId) {
    return this.inventoryDLService.getQuotationBySelected(ReqForQuotationId)
      .map((responseData) => {
        return responseData;
      });
  }
  public GetReqForQuotationById(ReqForQuotationId) {
    return this.inventoryDLService.GetReqForQuotationById(ReqForQuotationId)
      .map((responseData) => {
        return responseData;
      });
  }

  public GetQuotationItemsById(QuotationId) {
    return this.inventoryDLService.GetQuotationItemsById(QuotationId)
      .map((responseData) => {
        return responseData;
      });
  }
  public GetReqForQuotationList() {
    return this.inventoryDLService.GetReqForQuotationList()
      .map((responseData) => {
        return responseData;
      });
  }

  public GetQuotationList(ReqForQuotationId) {
    return this.inventoryDLService.GetQuotationList(ReqForQuotationId)
      .map((responseData) => {
        return responseData;
      });
  }

  public GetPurchaseOrderList(fromDate,toDate,Status: string) {
    return this.inventoryDLService.GetPurchaseOrderList(fromDate,toDate,Status)
      .map((responseData) => {
        return responseData;
      });
  }
  //GET: External PO vendor wise
  public GetPOlistVendorwise() {
    return this.inventoryDLService.GetPOlistVendorwise()
      .map((responseData) => {
        return responseData;
      });
  }
  //get item list
  public GetItemList() {
    return this.inventoryDLService.GetItemList()
      .map((responseData) => {
        return responseData;
      });
  }
  //get item list
  public GetRFQItemsList() {
    return this.inventoryDLService.GetRFQItemsList()
      .map((responseData) => {
        return responseData;
      });
  }
  //get view files list
  public GetViewFilesList(VendorId) {
    return this.inventoryDLService.GetViewFilesList(VendorId)
      .map((responseData) => {
        return responseData;
      });
  }

  //get view files list
  public GetQuotationItemsListList(VendorId) {
    return this.inventoryDLService.GetQuotationItemsListList(VendorId)
      .map((responseData) => {
        return responseData;
      });
  }
  //get vendor list
  public GetVendorList() {
    return this.inventoryDLService.GetVendorList()
      .map((responseData) => {
        return responseData;
      });
  }
  //get terms list
  public GetTermsList() {
    return this.inventoryDLService.GetTermsList()
      .map((responseData) => {
        return responseData;
      });
  }
  //GET: Getting Requisition items for creating PO
  public GetRequisitionforPO() {
    return this.inventoryDLService.GetRequisitionforPO().map(res => { return res; });
  }
  public GetItemwiseRequistionList() {
    return this.inventoryDLService.GetItemwiseRequistionList()
      .map(res => { return res })
  }

  //GET: Getting the return items list
  public GetVendorItemReturnList() {
    return this.inventoryDLService.GetVendorItemReturnList()
      .map(res => { return res })
  }

  //GET: Getting the write off items list
  public GetWriteOffItemList() {
    return this.inventoryDLService.GetWriteOffItemList()
      .map(res => { return res })
  }

  public GetVendorDetailsByVendorId(VendorId) {
    return this.inventoryDLService.GetVendorDetailsByVendorId(VendorId)
      .map((responseData) => {
        return responseData;
      });
  }

  public GetVendorDetails() {
    return this.inventoryDLService.GetVendorDetails()
      .map(res => { return res })
  }

  //GET Get GetAvailableQtyItemList Item List which has Available Quntity >0 from Stock
  public GetAvailableQtyItemList() {
    return this.inventoryDLService.GetAvailableQtyItemList()
      .map((responseData) => {
        return responseData;
      });
  }
  //GET: Get BatchNo with sum Available Quantity by ItemId from stock for WriteOff functionality
  public GetBatchNoListByItemId(ItemId) {

    return this.inventoryDLService.GetBatchNOListByItemId(ItemId)
      .map((responseData) => {
        return responseData;
      });
  }

  //GET:Get purchase order list by Purchase Order ID which is active or partialy completed
  public GetPurchaseOrderItemsByPOId(purchaseOrderId: number) {
    return this.inventoryDLService.GetPurchaseOrderItemsByPOId(purchaseOrderId)
      .map((responseData) => {
        return responseData;
      });
  }
  //GET: REQUISITION
  public GetDeptwiseRequisitionList(status: string) {
    return this.inventoryDLService.GetDeptwiseRequisitionList(status)
      .map((responseData) => {
        return responseData;
      });
  }

  //GET: REQUISITION
  public GetDepartmentDetailByRequisitionId(requisitionId: number) {
    return this.inventoryDLService.GetDepartmentDetailByRequisitionId(requisitionId)
      .map((responseData) => {
        return responseData;
      });
  }

  public GetRequisitionList(status: string, itemId: number) {
    return this.inventoryDLService.GetRequisitionList(status, itemId)
      .map((responseData) => {
        return responseData;
      });
  }
  //GET: STOCK : get all stock quantity details
  public GetStockList() {
    return this.inventoryDLService.GetStockList()
      .map(res => { return res });
  }
  //GET: STOCK : get stock details by ItemId
  public GetStockDetailsByItemId(ItemId) {
    return this.inventoryDLService.GetStockDetailsByItemId(ItemId)
      .map(res => { return res });
  }
  //GET: STOCK : get stock manage by ItemId
  public GetStockManageByItemId(ItemId) {
    return this.inventoryDLService.GetStockManageByItemId(ItemId)
      .map(res => { return res });
  }
  //GET: Internal : get item list by VendorId for ReturnToVendor
  public GetItemListbyVendorId(VendorId) {
    return this.inventoryDLService.GetItemListbyVendorId(VendorId)
      .map(res => { return res });
  }
  //GET: External : get all goods receipt list
  public GetGoodsReceiptList(fromDate, toDate) {
    return this.inventoryDLService.GetGoodsReceiptList(fromDate,toDate)
      .map(res => { return res });
  }

  public GetVendorsDetailsList() {
    return this.inventoryDLService.GetVendorsDetailsList()
      .map(res => { return res });
  }
  public GetEachVendorDetailsList(VendorId) {
    return this.inventoryDLService.GetEachVendorDetailsList(VendorId)
      .map(res => { return res });
  }

  //GET: External : get all goods receipt items by goodsReceiptId
  public GetGRItemsByGRId(GoodsReceiptId) {
    return this.inventoryDLService.GetGRItemsByGRId(GoodsReceiptId)
      .map(res => { return res });
  }
  
  //GET: get purchase order details by purchase order ID
  public GetPOItemsByPOId(PurchaseOrderId) {
    return this.inventoryDLService.GetPOItemsByPOId(PurchaseOrderId)
      .map(res => { return res });
  }
  //GET:Get All Requision with Requisition Items for Dispatch purpose
  GetRequisitionWithRItemsById(RequisitionId: number) {

    return this.inventoryDLService.GetRequisitionWithRItemsById(RequisitionId)
      .map((responseData) => {
        return responseData;
      });
  }
  //GET: get all requisition items by ItemId for Dispatch-All purpose
  GetRequisitionItemsbyItemId(ItemId: number) {
    return this.inventoryDLService.GetRequisitionItemsbyItemId(ItemId)
      .map((responseData) => {
        return responseData;
      });
  }
  //GET: Get All Requisition Items details for View requisition Items by Requisition ID
  GetRequisitionItemsByRID(RequisitionId: number) {
    return this.inventoryDLService.GetRequisitionItemsByRID(RequisitionId)
      .map((responseData) => {
        return responseData;
      });
  }

  //GET: Get the return item list on that created date
  GetReturnItemList(CreatedOn: string, VendorId: number) {
    return this.inventoryDLService.GetReturnItemList(CreatedOn, VendorId)
      .map((responseData) => {
        return responseData;
      });
  }

  //GET: getting vendor deatils and Item list according the vendorid
  GetVendorDetailsAndItemListByVendorId(vendorId: number) {

    return this.inventoryDLService.GetVendorDetailsAndItemListByVendorId(vendorId)
      .map((responseData) => {
        return responseData;
      });
  }
  GetBatchNoByItemId(itemId: number, vendorId: number) {

    return this.inventoryDLService.GetBatchNoByItemId(itemId, vendorId)
      .map((responseData) => {
        return responseData;
      });
  }
  //GET requested quotation list
  GetRequestedQuotationList() {
    return this.inventoryDLService.GetRequestedQuotationList()
      .map(res => { return res });
  }
  //Get Quotaion details
  GetQuotationDetails(ReqForQuotationId: number) {
    return this.inventoryDLService.GetQuotationDetails(ReqForQuotationId)
      .map((responseData) => {
        return responseData;
      });
  }

  //POST:posting the requisitions in requistion table..(tests-order.component)
  PostToPurchaseOrder(PO: PurchaseOrder) {

    //omiting the validators during post because it causes cyclic error during serialization in server side.
    //omit validator from inputPO (this will give us object)
    let newPO: any = _.omit(PO, ['PurchaseOrderValidator']);
    let newPoItems = PO.PurchaseOrderItems.map(item => {
      return _.omit(item, ['PurchaseOrderItemValidator']);
    });
    //assign items to above 'newPO' with exact same propertyname : 'PurchaseOrderItems'
    newPO.PurchaseOrderItems = newPoItems;

    let data = JSON.stringify(newPO);
    return this.inventoryDLService.PostToPurchaseOrder(data)
      .map(res => { return res })
  }

  UpdatePurchaseOrder(PO: PurchaseOrder) {

    //omiting the validators during post because it causes cyclic error during serialization in server side.
    //omit validator from inputPO (this will give us object)
    let newPO: any = _.omit(PO, ['PurchaseOrderValidator']);
    let newPoItems = PO.PurchaseOrderItems.map(item => {
      return _.omit(item, ['PurchaseOrderItemValidator']);
    });
    //assign items to above 'newPO' with exact same propertyname : 'PurchaseOrderItems'
    newPO.PurchaseOrderItems = newPoItems;

    let data = JSON.stringify(newPO);
    return this.inventoryDLService.UpdatePurchaseOrder(data)
      .map(res => { return res })
  }
  //Post:posting the request for quotation in requestforquotation table
  PostToReqForQuotation(PO: RequestForQuotationModel) {

    //omiting the validators during post because it causes cyclic error during serialization in server side.
    //omit validator from inputPO (this will give us object)
    let newPO: any = _.omit(PO, ['ReqForQuotationValidator']);
    let newPoItems = PO.ReqForQuotationItems.map(item => {
      return _.omit(item, ['ReqForQuotationItemValidator']);
    });
    //assign items to above 'newPO' with exact same propertyname : 'PurchaseOrderItems'
    newPO.ReqForQuotationItems = newPoItems;

    let data = JSON.stringify(newPO);
    return this.inventoryDLService.PostToReqForQuotation(data)
      .map(res => { return res })
  }
  //POST:Posting the Goods receipt data in Goods Receipt,Goods Receipt Items, Stock table
  PostToGoodsReceipt(goodsReceipt: GoodsReceipt) {
    let newGR: any = _.omit(goodsReceipt, ['GoodsReceiptValidator']);
    let newGrItems = goodsReceipt.GoodsReceiptItem.map(item => {
      return _.omit(item, ['GoodsReceiptItemValidator']);
    });

    newGR.GoodsReceiptItem = newGrItems;

    let data = JSON.stringify(newGR);
    return this.inventoryDLService.PostToGoodsReceipt(data)
      .map(res => { return res })
  }
  //POST: Posting Dispatched Items
  PostToDispatchItems(requisitionStockVM: RequisitionStockVMModel) {

    let newRequisitionSVM: any = requisitionStockVM;

    let dispatchItemsTemp = requisitionStockVM.dispatchItems.map(function (item) {
      var temp = _.omit(item, ['DispatchItemValidator']);
      return temp;
    });
    newRequisitionSVM.dispatchItems = dispatchItemsTemp;
    let data = JSON.stringify(newRequisitionSVM);
    return this.inventoryDLService.PostToDispatchItems(data)
      .map(res => { return res })

  }
  //POST : DISPATCH-ALL
  PostToDispatch(requisitionItemStockVM: RequisitionsStockVMModel) {
    let newRequisitionSVM: any = requisitionItemStockVM;
    for (var i = 0; i < requisitionItemStockVM.requisitions.length; i++) {
      let reqItemsTemp = requisitionItemStockVM.requisitions[i].RequisitionItems.map(function (item) {
        var temp = _.omit(item, ['Item']);
        return temp;
      });
      newRequisitionSVM.requisitions[i].RequisitionItems = reqItemsTemp;
    }
    let dispatchItemsTemp = requisitionItemStockVM.dispatchItems.map(function (item) {
      var temp = _.omit(item, ['DispatchItemValidator']);
      return temp;
    });
    newRequisitionSVM.dispatchItems = dispatchItemsTemp;
    let data = JSON.stringify(newRequisitionSVM);
    return this.inventoryDLService.PostToDispatch(data)
      .map(res => { return res })
  }
  //POST: Posting WriteOffItems
  PostToWriteOffItems(writeOffItems: Array<WriteOffItems>) {
    let newWriteOffItems: any = writeOffItems.map(item => {
      return _.omit(item, ['WriteOffItemValidator', 'SelectedItem', 'BatchNoList']);

    });
    let data = JSON.stringify(newWriteOffItems);
    return this.inventoryDLService.PostToWriteOffItems(data)
      .map(res => { return res })
  }
  //Posting the Requisiton and requisitionItems table
  PostToRequisition(requisition: Requisition) {
    let newRequ: any = _.omit(requisition, ['RequisitionValidator']);

    let newRequItems = requisition.RequisitionItems.map(item => {
      return _.omit(item, ['RequisitionItemValidator']);
    });


    newRequ.RequisitionItems = newRequItems;
    let data = JSON.stringify(newRequ);
    return this.inventoryDLService.PostToRequisition(data)
      .map(res => { return res })
  }
  //Save Return to vendor Item
  public PostToReturnToVendor(returnItems: Array<ReturnToVendorItem>) {
    let temp: any = returnItems.map(item => {
      return _.omit(item, ['ReturnItemValidator', 'Item', 'batchNoList']);
    });


    let data = JSON.stringify(temp);
    return this.inventoryDLService.PostToReturnToVendor(data)
      .map(res => { return res })
  }
  //PUT:Update Purchase order and Purchase Order Items Status after Goods Receipt Generation
  UpdatePOAndPOItemStatus(purchaseOrder: PurchaseOrder) {
    let data = JSON.stringify(purchaseOrder);
    return this.inventoryDLService.UpdatePOAndPOItemStatus(data)
      .map(res => { return res })
  }
  //PUT : Stock Manage
  public UpdateStock(stocks: Array<StockModel>) {
    let data = JSON.stringify(stocks);
    return this.inventoryDLService.PutStock(data)
      .map(res => { return res });
  }
  //PUT:update Selected Quotation and RequestedQuotation
  public UpdateVendorForPO(selectedVendor: QuotationModel) {

    var omit = _.omit(selectedVendor, ['QuotationValidator']);

    let data = JSON.stringify(omit);
    return this.inventoryDLService.UpdateVendorForPO(data)
      .map(res => { return res });

  }
  //Save Return to vendor Item
  public PostQuotationDetails(quoDetails: QuotationModel) {
    //let formToPost = new FormData();
    var omited = _.omit(quoDetails, ['QuotationValidator']);
    let newPoItems = quoDetails.quotationItems.map(item => {
      return _.omit(item, ['QuotationItemsValidator']);
    });

    omited.quotationItems = newPoItems;
    let data = JSON.stringify(omited);
    //  formToPost.append("quotationDetails", quotationDetails);

    return this.inventoryDLService.PostQuotationDetails(data)
      .map(res => { return res })
  }

  public AddQuotationFiles(filesToUpload, reqQuotation: QuotationUpLoadFileModel) {
    try {
      let formToPost = new FormData();
      var fileName: string;
      var omited = _.omit(reqQuotation, ['QuotationFileValidator']);

      var quotationFileDetails = JSON.stringify(omited);//encodeURIComponent();


      let uploadedImgCount = 0;

      for (var i = 0; i < filesToUpload.length; i++) {
        //to get the imagetype
        let splitImagetype = filesToUpload[i].name.split(".");
        let imageExtension = splitImagetype[1];

        fileName = "Quotation" + "_" + moment().format('DDMMYYHHmmss') + "." + imageExtension;
        // reqQuotation.FileName = fileName;
        formToPost.append("uploadQuotationFiles", filesToUpload[i], fileName);
      }

      formToPost.append("quotationFileDetails", quotationFileDetails);

      return this.inventoryDLService.PostQuotationFiles(formToPost)
        .map(res => res);

    } catch (exception) {
      throw exception;
    }



  }
}
