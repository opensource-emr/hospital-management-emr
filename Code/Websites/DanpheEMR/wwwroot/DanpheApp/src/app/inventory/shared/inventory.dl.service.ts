import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable()
export class InventoryDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  public optionsJson = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  constructor(public http: HttpClient) {

  }
  //GET:GetReqForQuotationItems
  public getQuotationBySelected(ReqForQuotationId) {
    return this.http.get<any>('/api/inventory?reqType=get-quotation-by-status&ReqForQuotationId=' + ReqForQuotationId, this.options);
  }

  //GET:GetReqForQuotationItems
  public GetReqForQuotationById(ReqForQuotationId) {
    return this.http.get<any>('/api/inventory?reqType=get-req-for-quotation-items&ReqForQuotationItemById=' + ReqForQuotationId, this.options);
  }

  //GET:GetQuotationItems
  public GetQuotationItemsById(QuotationId) {
    return this.http.get<any>('/api/inventory?reqType=get-quotation-items&QuotationItemById=' + QuotationId, this.options);
  }

  //GET:GetReqForQuotationList 
  public GetReqForQuotationList() {
    return this.http.get<any>('/api/inventory?reqType=get-req-for-quotation-list', this.options);
  }

  //GET:GetQuotationList
  public GetQuotationList(ReqForQuotationId) {
    return this.http.get<any>('/api/inventory?reqType=get-quotation-list&ReqForQuotationId=' + ReqForQuotationId, this.options);
  }


  //GET:GetAvailableQtyItemList
  public GetAvailableQtyItemList() {
    return this.http.get<any>('/api/inventory?reqType=getAvailableQtyItemList', this.options);
  }

  //GEt: Get BatchNOList with sum of AvailableQuantity from Stock for WriteOff
  public GetBatchNOListByItemId(ItemId) {
    return this.http.get<any>('/api/inventory?reqType=getbatchnobyitemid&ItemId=' + ItemId, this.options);
  }
  //GET: GET purchase ORder List
  public GetPurchaseOrderList(fromDate, toDate, Status: string) {
    return this.http.get<any>('/api/inventory?reqType=purchaseOrderList&FromDate=' + fromDate + "&ToDate=" + toDate + "&status=" + Status, this.options);
  }

    GetAllPOVerifiers() {
      return this.http.get<any>('/api/Inventory/GetAllPOVerifiers', this.options);
    }
  //
  public GetPOlistVendorwise() {
    return this.http.get<any>('/api/inventory?reqType=getpolistVendorwise', this.options);
  }
  //GET: GET purchase order Items by Purchase Order Id
  public GetPurchaseOrderItemsByPOId(purchaseOrderId: number) {
    return this.http
      .get<any>("/api/Inventory?reqType=purchaseOrderItemsByPOId" + '&purchaseOrderId=' +
        purchaseOrderId, this.options);
  }
  //GET: Get ItemList
  public GetItemList() {
    return this.http.get<any>('/api/inventory?reqType=ItemList', this.options);
  }

  

  //GET: Get ItemList
  public GetRFQItemsList() {
    return this.http.get<any>('/api/inventory?reqType=rfqitemslist', this.options);
  }

  //GET: Get viewFilesList
  public GetViewFilesList(VendorId) {
    return this.http.get<any>('/api/inventory?reqType=get-view-files-list&vendorId=' + VendorId, this.options);
  }
  //GET: Get viewFilesList
  public GetQuotationItemsListList(VendorId) {
    return this.http.get<any>('/api/inventory?reqType=get-quotation-items-list&vendorId=' + VendorId, this.options);
  }

  //GET: Get VendorList
  public GetVendorList() {
    return this.http.get<any>('/api/inventory?reqType=VendorList', this.options);
  }
  //GET: Get CreditNoteNo
  public GetCreditNoteNum() {
    return this.http.get<any>('/api/inventory?reqType=getcreditnoteno', this.options);
  }
  //GET: Get TermsList
  public GetTermsList(TermsApplicationId:number) {
    return this.http.get<any>('/api/InventorySettings/GetTermsListByTermsApplicationId/'+ TermsApplicationId, this.options);
  }
  //Get:Requistion  update for item
  public GetToRequistion(RequisitionId) {
    return this.http.get<any>('/api/inventory?reqType=Requisition&RequisitionId=' + RequisitionId, this.options);
  }
  //GET: Getting Requisition items for creating PO
  public GetRequisitionforPO() {
    return this.http.get<any>('/api/inventory?reqType=RequisitionforPO', this.options);
  }
  public GetItemwiseRequistionList() {
    return this.http.get<any>("/api/inventory?reqType=itemwiseRequistionList", this.options);
  }

  public GetVendorItemReturnList() {
    return this.http.get<any>("/api/inventory?reqType=returnVendorItemList", this.options);
  }

  public GetWriteOffItemList() {
    return this.http.get<any>("/api/inventory?reqType=writeOffItemList", this.options);
  }

  //GET: getting vendor accodring the vendorid
  public GetVendorDetailsByVendorId(vendorId: number) {
    return this.http.get<any>("/api/inventory?reqType=VendorDetails&vendorId=" + vendorId, this.options);
  }

  public GetVendorDetails() {
    return this.http.get<any>("/api/inventory?reqType=getvendordetails", this.options);
  }
  //GET: Get Requisition and Requisition Items with Stock Records for Dispatch Items
  public GetRequisitionWithRItemsById(RequisitionId: number) {
    return this.http.get<any>("/api/inventory?reqType=RequisitionById&RequisitionId=" + RequisitionId, this.options);
  }
  //GET: get all requisition items by ItemId for Dispatch-All purpose
  public GetRequisitionItemsbyItemId(itmId: number) {
    return this.http.get<any>("/api/inventory?reqType=RequisitionByItemId&ItemId=" + itmId, this.optionsJson);
  }
  //GET: Dept wise Requisition List by Status
  public GetAllSubstoreRequistionList(fromDate: string, toDate: string) {
    return this.http.get<any>('/api/Inventory/GetAllSubstoreRequistionList/' + fromDate + '/' + toDate, this.optionsJson);
  }
  //GET: Dept wise Requisition List by Status
  public GetSubstoreRequistionList(fromDate: string, toDate: string, storeId: number) {
    return this.http.get<any>('/api/Inventory/GetSubstoreRequistionList/' + fromDate + '/' + toDate + '/' + storeId, this.optionsJson);
  }

  //GET: Department details by requisition id
  public GetDepartmentDetailByRequisitionId(requisitionId: number) {
    return this.http.get<any>('/api/inventory?reqType=deptDetail&RequisitionId=' + requisitionId, this.options);
  }

  //GET:Requisition List by Status
  public GetRequisitionList(status: string, itemId) {
    return this.http.get<any>('/api/inventory?reqType=requisitionList&status=' + status + "&ItemId=" + itemId, this.options);
  }
  //GET: STOCK : get all stock quantity details
  public GetStockList() {
    return this.http.get<any>("/api/inventory?reqType=stockList");
  }
  //GET: STOCK : get stock details by ItemId
  public GetStockDetailsByItemId(ItemId) {
    return this.http.get<any>("/api/inventory?reqType=stockDetails&ItemId=" + ItemId, this.options);
  }
  //GET: STOCK : get stock manage by ItemId
  public GetStockManageByItemId(ItemId) {
    return this.http.get<any>("/api/inventory?reqType=stockManage&ItemId=" + ItemId, this.options);
  }
  //GET: Internal : get item list by VendorId for ReturnToVendor
  public GetItemListbyVendorId(VendorId, GoodsReceiptNo, FiscYrId) {
    return this.http.get<any>("/api/inventory?reqType=itemListbyVendorId&vendorId=" + VendorId + "&GoodsReceiptNo=" + GoodsReceiptNo + "&FiscYrId=" + FiscYrId, this.options);
  }
  //GET: External : get all goods receipt list
  public GetGoodsReceiptList(fromDate, toDate) {
    return this.http.get<any>("/api/inventory?reqType=goodsreceipt&FromDate=" + fromDate + "&ToDate=" + toDate, this.options);
  }
  public GetVendorsDetailsList() {
    return this.http.get<any>("/api/inventory?reqType=get-goods-receipt-groupby-vendor");
  }
  public GetEachVendorDetailsList(VendorId) {
    return this.http.get<any>("/api/inventory?reqType=getGrDetailByVendorId&vendorId=" + VendorId);
  }
  //GET: External : get all goods receipt items by goodsReceiptId
  public GetGRItemsByGRId(goodsReceiptId) {
    return this.http.get<any>("/api/inventory?reqType=GRItemsDetailsByGRId&goodsReceiptId=" + goodsReceiptId, this.options);
  }

  //GET: get purchase order details by purchase order ID
  public GetPOItemsByPOId(purchaseOrderId) {
    return this.http.get<any>("/api/inventory?reqType=POItemsDetailsByPOId&purchaseOrderId=" + purchaseOrderId, this.options);
  }

  //Get: Single Requisition Details (RequisitionItems) by RequisitionId for View
  public GetRequisitionItemsByRID(RequisitionId: number) {
    return this.http.get<any>('/api/inventory?reqType=requisitionItemsForView&RequisitionId=' + RequisitionId);
  }

  //Get: Single Requisition Details (RequisitionItems) by RequisitionId for View  -- sud-19Feb'20
  public GetRequisitionItemsForViewByReqId(RequisitionId: number) {
    return this.http.get<any>('/api/inventory?reqType=get-requisitionitems-for-view&RequisitionId=' + RequisitionId);
  }


  public GetDispatchDetails(RequisitionId: number) {
    return this.http.get<any>('/api/inventory?reqType=dispatchview&RequisitionId=' + RequisitionId);
  }

  public GetCancelDetails(RequisitionId: number) {
    return this.http.get<any>('/api/inventory?reqType=cancelview&RequisitionId=' + RequisitionId);
  }
  public GetDispatchItemByDispatchId(DispatchId: number) {
    return this.http.get<any>('/api/inventory?reqType=dispatchviewbyDispatchId&DispatchId=' + DispatchId);
  }
  //Get:Return items details
  public GetReturnItemList(CreatedOn: string, VendorId: number) {
    return this.http.get<any>('/api/inventory?reqType=returnItemDetails&CreatedOn=' + CreatedOn + '&VendorId=' + VendorId);
  }
  //GET: getting vendor deatils and Item list according the vendorid
  public GetVendorDetailsAndItemListByVendorId(vendorId: number) {
    return this.http.get<any>('/api/inventory?reqType=ItemListByVendorId&vendorId=' + vendorId, this.options);
  }
  //GET: getting BatchNo By ItemId
  public GetBatchNoByItemId(itemId: number, vendorId: number) {
    return this.http.get<any>('/api/inventory?reqType=batchNoByItemIdAndVendorId&itemId=' + itemId + '&vendorId=' + vendorId, this.options);
  }
  //GET: Getiing requested quotation list 
  public GetRequestedQuotationList() {
    return this.http.get<any>("/api/inventory?reqType=requestedQuotations", this.options);
  }
  //GEt: Getting quotaion Details
  public GetQuotationDetails(ReqForQuotationId: number) {
    return this.http.get<any>('/api/inventory?reqType=ReqForQuotationDetails&ReqForQuotationItemById=' + ReqForQuotationId, this.options);
  }
  //GEt: Getting quotaion Details
  public GetPORequisition(fromDate,toDate) {
    return this.http.get<any>('/api/inventory?reqType=PORequisition&FromDate=' + fromDate + "&ToDate=" + toDate, this.options);
  }
  public GetPurchaseRequestById(RequisitionId) {
    return this.http.get<any>('/api/inventory?reqType=PORequisitionItemsById&RequisitionId=' + RequisitionId, this.options);
  }
  public GetPurchaseRequestItemsById(PurchaseRequestId) {
    return this.http.get<any>('/api/Inventory/GetPurchaseRequestItemsById/' + PurchaseRequestId, this.options);
  }
  public GetItemPriceHistory() {
    return this.http.get<any>('/api/Inventory/GetAllItemPriceHistory' , this.options);
  }
  public GetAllInventoryFiscalYears() {
    return this.http.get<any>('/api/Inventory/GetAllInventoryFiscalYears' , this.options);
  }
  //Get: Track Requisition by id
  public TrackRequisitionById(RequisitionId) {
    return this.http.get<any>('/api/Inventory/TrackRequisitionById/' + RequisitionId, this.options);
  }
//GET:FiscalYears
  public GetAllFiscalYears() {
    return this.http.get<any>("/api/Billing?reqType=all-fiscalYears");
    }

  //POST: Save Purchase Order
  public PostToPurchaseOrder(PurchaseOrderObjString: string) {
    let data = PurchaseOrderObjString;
    return this.http.post<any>("/api/Inventory?reqType=PurchaseOrder", data, this.options);
  }
  //POST: cancel purchase order
  public PostPurchaseOrderCancelDetail(POId,CancelRemarks) {
    try {
      return this.http.post<any>(`/api/Inventory?reqType=cancel-purchase-order&purchaseOrderId=${POId}`,CancelRemarks, this.options);
    } catch (ex) {
      throw ex;
    }
  }
  //POST: cancel Requisition
  public WithdrawRequisitionById(requisitionId, CancelRemarks) {
    try {
      return this.http.post<any>("/api/Inventory/WithdrawRequisitionById/" + requisitionId, CancelRemarks, this.optionsJson);
    } catch (ex) {
      throw ex;
    }
  }
  //POST: cancel Requisition
  public WithdrawPurchaseRequestById(PurchaseRequestId, CancelRemarks) {
    try {
      return this.http.post<any>("/api/Inventory/WithdrawPurchaseRequestById/" + PurchaseRequestId, CancelRemarks, this.optionsJson);
    } catch (ex) {
      throw ex;
    }
  }
  //POST: cancel goods receipt
  PostGoodsReceiptCancelDetail(GoodsReceiptId, CancelRemarks) {
    try {
      return this.http.post<any>("/api/Inventory/CancelGoodsReceipt/" + GoodsReceiptId, CancelRemarks, this.optionsJson);
    } catch (ex) {
      throw ex;
    }
  }
  public UpdatePurchaseOrder(PurchaseOrderObjString: string) {
    let data = PurchaseOrderObjString;
    return this.http.put<any>("/api/Inventory?reqType=UpdatePurchaseOrder", data, this.options);
  }
  //POST: Save Purchase Order Requisition
  public PostToPORequisition(PORequisitionObjString: string) {
    let data = PORequisitionObjString;
    return this.http.post<any>("/api/Inventory?reqType=PostPORequisition", data, this.options);

  }
  //POST: Save RequestForQuotation
  public PostToReqForQuotation(ReqForQuotationObjString: string) {
    let data = ReqForQuotationObjString;
    return this.http.post<any>("/api/Inventory?reqType=ReqForQuotation", data, this.options);

  }
  //POST:Save Goods Receipt
  public PostToGoodsReceipt(GoodsReceiptObjString: string) {
    let data = GoodsReceiptObjString;
    return this.http.post<any>("/api/Inventory?reqType=GoodsReceipt", data, this.options);
  }
  //POST:Save dispatched Items to database
  public PostToDispatchItems(DispatchItemsObjString: string) {
    let data = DispatchItemsObjString;
    return this.http.post<any>("/api/Inventory?reqType=DispatchItems", data, this.options);
  }
  //Save Goods Receipt
  public PostToRequisition(RequisitionObjString: string) {
    let data = RequisitionObjString;
    return this.http.post<any>("/api/Inventory?reqType=Requisition", data, this.options);
  }
  //Save Goods Receipt
  public PostDirectDispatch(RequisitionObjString: string) {
    let data = RequisitionObjString;
    return this.http.post<any>("/api/Inventory/PostDirectDispatch", data, this.optionsJson);
  }
  //Save Return to vendor Item
  public PostToReturnToVendor(ReturnToVendorObjString: string) {
    let data = ReturnToVendorObjString;
    return this.http.post<any>("/api/Inventory?reqType=ReturnToVendor", data, this.options);
  }

  public PostQuotationDetails(QuotatationItemsString: any) {
    let data = QuotatationItemsString;
    return this.http.post<any>("/api/Inventory?reqType=quotationDetails", data, this.options);
  }

  //POST: Save Write-Off Items
  public PostToWriteOffItems(WriteOffItemsObjString: string) {
    let data = WriteOffItemsObjString;
    return this.http.post<any>("/api/Inventory?reqType=WriteOffItems", data, this.options);
  }

  public PostQuotationFiles(formData: any) {
    try {
      return this.http.post<any>("/api/Inventory?reqType=uploadQuotationFiles", formData);
    } catch (exception) {
      throw exception;
    }
  }
  //PUT:

  //PUT:Update Purchase order and Purchase Order Items Status after Goods Receipt Generation
  UpdatePOAndPOItemStatus(PurchaseOrderObjString: string) {

    let data = PurchaseOrderObjString;
    return this.http.put<any>("/api/Inventory?reqType=updatepoandpoitemstatus", data, this.options);
  }

  //PUT:Update Purchase order and Purchase Order Items Status after Goods Receipt Generation
  UpdateRequisitionStatus(ReqObjString: string) {

    let data = ReqObjString;
    return this.http.put<any>("/api/Inventory?reqType=updaterequisitionstatus", data, this.options);
  }
  //PUT:Update Purchase order and Purchase Order Items Status after Goods Receipt Generation
  ApprovePORequisition(data) {
    return this.http.put<any>("/api/Inventory?reqType=approvePORequisition", data, this.options);
  }
  //PUT:Update Purchase order and Purchase Order Items Status after Goods Receipt Generation
  ApproveRequisition(CurrentVerificationLevel: number, RequisitionId: number, StoreId: number) {
    return this.http.put<any>("/api/Inventory/ApproveRequisition/" + CurrentVerificationLevel + "/" + RequisitionId + "/" + StoreId, this.options);
  }
  //PUT:Update Purchase order and Purchase Order Items Status after Goods Receipt Generation
  RejectRequisition(CurrentVerificationLevel: number, RequisitionId: number, StoreId: number) {
    return this.http.put<any>("/api/Inventory/RejectRequisition/" + CurrentVerificationLevel + "/" + RequisitionId + "/" + StoreId, this.options);
  }
  //PUT : Stock Manage
  PutStock(data) {
    return this.http.put<any>("/api/Inventory?reqType=stockManage", data, this.options);
  }
  UpdateVendorForPO(data) {
    return this.http.put<any>("/api/Inventory?reqType=SelectedVendorforPO", data, this.options);
  }
  public UpdatePORequisition(PORequisitionObjString: string) {
    let data = PORequisitionObjString;
    return this.http.put<any>("/api/Inventory?reqType=UpdatePORequisition", data, this.options);
  }
  public UpdatePORequisitionAfterPOCreation(reqId: number) {
    let data = reqId.toString();
    return this.http.put<any>("/api/Inventory?reqType=UpdatePORequisitionAfterPOCreation", data, this.options);

  }

  //Cancel remaining items 
  CancelRequisitionItems(data) {
    return this.http.put<any>("/api/Inventory?reqType=cancelRequisitionItems", data, this.options);
  }
  //GET : vendor's billing history (goods received)
  public GetGRVendorBillingHistory() {
    return this.http.get<any>('/api/Inventory/GetAllGRVendorBillingHistory', this.options);
  }
}
