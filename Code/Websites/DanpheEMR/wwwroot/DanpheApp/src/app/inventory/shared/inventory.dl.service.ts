import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';


@Injectable()
export class InventoryDLService {
  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
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
  //GET: Get TermsList
  public GetTermsList() {
    return this.http.get<any>('/api/inventory?reqType=TermsList', this.options);
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
    return this.http.get<any>("/api/inventory?reqType=RequisitionByItemId&ItemId=" + itmId, this.options);
  }
  //GET: Dept wise Requisition List by Status
  public GetDeptwiseRequisitionList(status: string) {
    return this.http.get<any>('/api/inventory?reqType=deptwiseRequistionList&status=' + status, this.options);
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
  public GetItemListbyVendorId(VendorId) {
    return this.http.get<any>("/api/inventory?reqType=itemListbyVendorId&vendorId=" + VendorId, this.options);
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



  //POST: Save Purchase Order
  public PostToPurchaseOrder(PurchaseOrderObjString: string) {
    let data = PurchaseOrderObjString;
    return this.http.post<any>("/api/Inventory?reqType=PurchaseOrder", data, this.options);

  }
  public UpdatePurchaseOrder(PurchaseOrderObjString: string) {
    let data = PurchaseOrderObjString;
    return this.http.post<any>("/api/Inventory?reqType=UpdatePurchaseOrder", data, this.options);
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
  //POST:Save dispatched Items to database (DISPATCH-ALL)
  public PostToDispatch(DispatchItemsObjString: string) {
    let data = DispatchItemsObjString;
    return this.http.post<any>("/api/Inventory?reqType=DispatchAllItems", data, this.options);
  }
  //Save Goods Receipt
  public PostToRequisition(RequisitionObjString: string) {
    let data = RequisitionObjString;
    return this.http.post<any>("/api/Inventory?reqType=Requisition", data, this.options);
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
  //PUT : Stock Manage
  PutStock(data) {
    return this.http.put<any>("/api/Inventory?reqType=stockManage", data, this.options);
  }
  UpdateVendorForPO(data) {
    return this.http.put<any>("/api/Inventory?reqType=SelectedVendorforPO", data, this.options);
  }
}
