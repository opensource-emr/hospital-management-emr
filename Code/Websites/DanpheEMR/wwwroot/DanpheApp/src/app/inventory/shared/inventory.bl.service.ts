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
import { PurchaseRequestModel } from './purchase-request.model';
import { ReturnToVendorModel } from './return-to-vendor.model';
import { GoodsReceiptItems } from './goods-receipt-item.model';
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

  public GetPurchaseOrderList(fromDate, toDate, Status: string) {
    return this.inventoryDLService.GetPurchaseOrderList(fromDate, toDate, Status)
      .map((responseData) => {
        return responseData;
      });
  }
  public GetAllPOVerifiers() {
    return this.inventoryDLService.GetAllPOVerifiers()
      .map(res => { return res; });
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
  public GetItemListByStoreId(StoreId: number) {
    return this.inventoryDLService.GetItemListByStoreId(StoreId)
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
  //get creditNoteno
  public GetCreditNoteNum() {
    return this.inventoryDLService.GetCreditNoteNum()
      .map((responseData) => {
        return responseData;
      });
  }
  //get terms list
  public GetTermsList(TermsApplicationId: number) {
    return this.inventoryDLService.GetTermsList(TermsApplicationId)
      .map((responseData) => {
        return responseData;
      });
  }

  //Get:Requistion  update for item
  public GetToRequistion(requisitionId: number) {
    return this.inventoryDLService.GetToRequistion(requisitionId).map(res => { return res; });
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
  public GetAvailableQtyItemList(storeId: number) {
    return this.inventoryDLService.GetAvailableQtyItemList(storeId)
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
  public GetAllSubstoreRequistionList(fromDate: string, toDate: string) {
    return this.inventoryDLService.GetAllSubstoreRequistionList(fromDate, toDate)
      .map((responseData) => {
        return responseData;
      });
  }
  //GET: REQUISITION
  public GetSubstoreRequistionList(fromDate: string, toDate: string, storeId: number) {
    return this.inventoryDLService.GetSubstoreRequistionList(fromDate, toDate, storeId)
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
  public GetStockListForDirectDispatch(storeId: number) {
    return this.inventoryDLService.GetStockListForDirectDispatch(storeId).map(res => res);
  }
  //GET: STOCK : get stock details by ItemId
  public GetStockDetailsByItemId(ItemId, StoreId) {
    return this.inventoryDLService.GetStockDetailsByItemId(ItemId, StoreId)
      .map(res => { return res });
  }
  //GET: STOCK : get stock manage by ItemId
  public GetStockManageByItemId(ItemId, StoreId) {
    return this.inventoryDLService.GetStockManageByItemId(ItemId, StoreId)
      .map(res => { return res });
  }
  //GET: Internal : get item list by VendorId for ReturnToVendor
  public GetItemListForReturnToVendor(VendorId, GoodsReceiptNo, FiscYrId, StoreId) {
    return this.inventoryDLService.GetItemListForReturnToVendor(VendorId, GoodsReceiptNo, FiscYrId, StoreId)
      .map(res => { return res });
  }
  //GET: External : get all goods receipt list
  public GetGoodsReceiptList(fromDate, toDate) {
    return this.inventoryDLService.GetGoodsReceiptList(fromDate, toDate)
      .map(res => { return res });
  }

  //GET: External : get all goods receipt list
  public GetGoodsReceiptStockList(fromDate, toDate) {
    return this.inventoryDLService.GetGoodsReceiptStockList(fromDate, toDate)
      .map(res => { return res });
  }

  //GET: External : get all  fixed asset donation list
  public GetFixedAssetDonationList() {
    return this.inventoryDLService.GetFixedAssetDonationList()
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

  //GET: Get All Requisition Items details for View requisition Items by Requisition ID -- new function: sud-19Feb'20
  GetRequisitionItemsForViewByReqId(RequisitionId: number) {
    return this.inventoryDLService.GetRequisitionItemsForViewByReqId(RequisitionId)
      .map((responseData) => {
        return responseData;
      });
  }

  GetDispatchDetails(RequisitionId: number) {
    return this.inventoryDLService.GetDispatchDetails(RequisitionId)
      .map((responseData) => {
        return responseData;
      });
  }

  GetCancelDetails(RequisitionId: number) {
    return this.inventoryDLService.GetCancelDetails(RequisitionId)
      .map((responseData) => {
        return responseData;
      });
  }
  GetDispatchItemByDispatchId(DispatchId: number) {
    return this.inventoryDLService.GetDispatchItemByDispatchId(DispatchId)
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
  //GET PO requisition
  GetPORequisition(fromDate, toDate) {
    return this.inventoryDLService.GetPORequisition(fromDate, toDate)
      .map(res => { return res });
  }
  //Get Active Inventory List
  GetActiveInventoryList() {
    return this.inventoryDLService.GetActiveInventoryList()
      .map(res => { return res });
  }
  //GET PO requisition
  GetPurchaseRequestById(RequisitionId: number) {
    return this.inventoryDLService.GetPurchaseRequestById(RequisitionId)
      .map(res => { return res });
  }
  GetPurchaseRequestItemsById(RequisitionId: number) {
    return this.inventoryDLService.GetPurchaseRequestItemsById(RequisitionId)
      .map(res => { return res });
  }
  GetItemPriceHistory() {
    return this.inventoryDLService.GetItemPriceHistory()
      .map(res => { return res });
  }
  GetAllInventoryFiscalYears() {
    return this.inventoryDLService.GetAllInventoryFiscalYears()
      .map(res => { return res });
  }
  //GET: Track Requisition and all its verification
  TrackRequisitionById(RequisitionId) {
    return this.inventoryDLService.TrackRequisitionById(RequisitionId)
      .map(res => { return res });
  }

  //GET:FiscalYears
  public GetAllFiscalYears() {
    return this.inventoryDLService.GetAllFiscalYears()
      .map(res => res);
  }

  public GetAvailableQuantityByItemId(ItemId: number) {
    return this.inventoryDLService.GetAvailableQuantityByItemId(ItemId)
      .map(res => res);
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
  //POST: posting the purchase order cancel
  PostPurchaseOrderCancelDetail(selectedPoId, cancelationRemarks) {
    try {
      return this.inventoryDLService.PostPurchaseOrderCancelDetail(selectedPoId, cancelationRemarks)
        .map(res => { return res });
    } catch (ex) {
      throw ex;
    }
  }
  //POST: posting the requisition cancel
  WithdrawRequisitionById(RequisitionId, cancelationRemarks) {
    try {
      return this.inventoryDLService.WithdrawRequisitionById(RequisitionId, cancelationRemarks)
        .map(res => { return res });
    } catch (ex) {
      throw ex;
    }
  }
  //POST: posting the requisition cancel
  WithdrawPurchaseRequestById(PurchaseRequestId, cancelationRemarks) {
    try {
      return this.inventoryDLService.WithdrawPurchaseRequestById(PurchaseRequestId, cancelationRemarks)
        .map(res => { return res });
    } catch (ex) {
      throw ex;
    }
  }
  //POST: posting the  goods receipt cancel
  PostGoodsReceiptCancelDetail(selectedGRId, cancelationRemarks) {
    try {
      return this.inventoryDLService.PostGoodsReceiptCancelDetail(selectedGRId, cancelationRemarks)
        .map(res => { return res });
    } catch (ex) {
      throw ex;
    }
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
  //POST:posting the requisitions in PO requistion table..(tests-order.component)
  PostToPORequisition(PO: PurchaseRequestModel) {

    //omiting the validators during post because it causes cyclic error during serialization in server side.
    //omit validator from inputPO (this will give us object)
    let newPurchaseRequest: any = _.omit(PO, ['PurchaseRequestValidator']);
    let newPurchaseRequestItems = PO.PurchaseRequestItems.map(item => {
      return _.omit(item, ['PurchaseRequestItemValidator']);
    });
    //assign items to above 'newPO' with exact same propertyname : 'PurchaseOrderItems'
    newPurchaseRequest.PurchaseRequestItems = newPurchaseRequestItems;

    let data = JSON.stringify(newPurchaseRequest);
    return this.inventoryDLService.PostToPORequisition(data)
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
  //POST: Posting Dispatched Items
  PostToDispatchItems(dispatchItems: Array<DispatchItems>) {


    let dispatchItemsTemp = dispatchItems.map(function (item) {
      var temp = _.omit(item, ['DispatchItemValidator']);
      return temp;
    });
    dispatchItems = dispatchItemsTemp;
    let data = JSON.stringify(dispatchItems);
    return this.inventoryDLService.PostToDispatchItems(data)
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
  //Posting the Requisiton and requisitionItems table
  PostDirectDispatch(dispatchItems: DispatchItems[]) {
    let dispatchItemsTemp = dispatchItems.map(function (item) {
      var temp = _.omit(item, ['DispatchItemValidator']);
      return temp;
    });
    dispatchItems = dispatchItemsTemp;
    let data = JSON.stringify(dispatchItems);
    return this.inventoryDLService.PostDirectDispatch(data)
      .map(res => { return res })
  }
  //Save Return to vendor Item
  public PostToReturnToVendor(returnToVendor: ReturnToVendorModel) {
    let temp: any = returnToVendor.itemsToReturn.map(item => {
      return _.omit(item, ['ReturnItemValidator', 'Item', 'batchNoList']);
    });
    returnToVendor.itemsToReturn = temp;

    let data = JSON.stringify(returnToVendor);
    return this.inventoryDLService.PostToReturnToVendor(data)
      .map(res => { return res })
  }
  //PUT:Update Purchase order and Purchase Order Items Status after Goods Receipt Generation
  UpdatePOAndPOItemStatus(purchaseOrder: PurchaseOrder) {
    let data = JSON.stringify(purchaseOrder);
    return this.inventoryDLService.UpdatePOAndPOItemStatus(data)
      .map(res => { return res })
  }

  //PUT:Update Purchase order and Purchase Order Items Status after Goods Receipt Generation
  UpdateRequisitionStatus(req: Requisition) {
    let data = JSON.stringify(req);
    return this.inventoryDLService.UpdateRequisitionStatus(data)
      .map(res => { return res })
  }
  //PUT:Approve requisition
  ApprovePORequisition(RequisitionId) {
    let data = JSON.stringify(RequisitionId);
    return this.inventoryDLService.ApprovePORequisition(data)
      .map(res => { return res })
  }
  //PUT:Approve requisition
  ApproveRequisition(CurrentVerificationLevel: number, RequisitionId: number, StoreId: number) {
    return this.inventoryDLService.ApproveRequisition(CurrentVerificationLevel, RequisitionId, StoreId)
      .map(res => { return res })
  }
  //PUT:Deny requisition
  RejectRequisition(CurrentVerificationLevel: number, RequisitionId: number, StoreId: number) {
    return this.inventoryDLService.RejectRequisition(CurrentVerificationLevel, RequisitionId, StoreId)
      .map(res => { return res })
  }
  //PUT : Stock Manage
  public UpdateStock(stocks: Array<StockModel>) {
    let data = JSON.stringify(stocks);
    return this.inventoryDLService.PutStock(data)
      .map(res => { return res });
  }
  //Cancel itms 
  CancelRequisitionItems(requisition: Requisition) {
    let newRequ: any = _.omit(requisition, ['RequisitionValidator']);

    let newRequItems = requisition.RequisitionItems.map(item => {
      return _.omit(item, ['RequisitionItemValidator']);
    });

    newRequ.RequisitionItems = newRequItems;
    let data = JSON.stringify(newRequ);
    return this.inventoryDLService.CancelRequisitionItems(data)
      .map(res => { return res })
  }

  //PUT:update Selected Quotation and RequestedQuotation
  public UpdateVendorForPO(selectedVendor: QuotationModel) {

    var omit = _.omit(selectedVendor, ['QuotationValidator']);

    let data = JSON.stringify(omit);
    return this.inventoryDLService.UpdateVendorForPO(data)
      .map(res => { return res });

  }
  //PUT: Edit PO Requisition
  UpdatePORequisition(PO: PurchaseRequestModel) {

    //omiting the validators during post because it causes cyclic error during serialization in server side.
    //omit validator from inputPO (this will give us object)
    let newPORequisition: any = _.omit(PO, ['PurchaseRequestValidator']);
    let newPoItemsRequisition = PO.PurchaseRequestItems.map(item => {
      return _.omit(item, ['PurchaseRequestItemValidator']);
    });
    //assign items to above 'newPO' with exact same propertyname : 'PurchaseOrderItems'
    newPORequisition.PurchaseRequestItems = newPoItemsRequisition;

    let data = JSON.stringify(newPORequisition);
    return this.inventoryDLService.UpdatePORequisition(data)
      .map(res => { return res })
  }

  UpdatePORequisitionAfterPOCreation(RequisitionId: number) {
    return this.inventoryDLService.UpdatePORequisitionAfterPOCreation(RequisitionId)
      .map(res => { return res })
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
  //GET : vendor's goods received billing history
  public GetGRVendorBillHistory() {
    return this.inventoryDLService.GetGRVendorBillingHistory()
      .map(res => { return res });
  }

  //POST: Add GR in Stock
  ReceiveGR(grId: number, receivedRemarks: string) {
    return this.inventoryDLService.ReceiveGR(grId, receivedRemarks)
      .map(res => { return res })
  }
  //GET: External : get all  fixed asset location list
  // public GetFixedAssetLocationList() {
  //   return this.inventoryDLService.GetFixedAssetLocationList()
  //     .map(res => { return res });
  // }
}
