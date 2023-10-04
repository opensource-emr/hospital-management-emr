import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PurchaseOrderDraft } from '../../procurement/purchase-order/purchase-order-draft.model';
import { ActivateInventoryService } from '../../shared/activate-inventory/activate-inventory.service';
import { Requisition } from './requisition.model';


@Injectable()
export class InventoryDLService {


  public options = {
    headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
  };
  public optionsJson = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
  };
  // public selectedStoreId: number = 0;
  constructor(public http: HttpClient,
    private _activateInventoryService: ActivateInventoryService) {
  }
  // ngOnInit(){
  //   // bikash, 15th-march'21: added to identify which Inventory is calling the request
  //   this.selectedStoreId = this._activateInventoryService.activeInventory.StoreId;
  // }
  //GET:GetReqForQuotationItems
  public getQuotationBySelected(reqForQuotationId) {
    return this.http.get<any>(`/api/Inventory/QuotationByStatus?reqForQuotationId=${reqForQuotationId}&storeId=${this._activateInventoryService.activeInventory.StoreId}`, this.options);
  }

  //GET:GetReqForQuotationItems
  public GetReqForQuotationById(reqForQuotationId) {
    return this.http.get<any>(`/api/Inventory/RequestForQuotationDetails?reqForQuotationId=${reqForQuotationId}`, this.options);
  }

  //GET:GetQuotationItems
  public GetQuotationItemsById(quotationId) {
    return this.http.get<any>(`/api/Inventory/QuotationItems?quotationId=${quotationId}`, this.options);
  }

  //GET:GetReqForQuotationList 
  public GetReqForQuotationList() {
    return this.http.get<any>(`/api/Inventory/RequestForQuotations?storeId=${this._activateInventoryService.activeInventory.StoreId}`, this.options);
  }

  //GET:GetQuotationList
  public GetQuotationList(reqForQuotationId) {
    return this.http.get<any>(`/api/Inventory/Quotations?reqForQuotationId=${reqForQuotationId}`, this.options);
  }


  //GET:GetAvailableQtyItemList
  public GetAvailableQtyItemList(storeId: number) {
    //return this.http.get<any>('/api/inventory/AvailableQtyItem?storeId=' + storeId, this.options);
    return this.http.get<any>(`/api/Inventory/AvailableItemQty?storeId=${storeId}`, this.options);
  }
  //GEt: Get BatchNOList with sum of AvailableQuantity from Stock for WriteOff
  public GetBatchNOListByItemId(itemId) {
    return this.http.get<any>(`/api/Inventory/BatchNumbers?itemId=${itemId}`, this.options);
  }
  //GET: GET purchase ORder List
  public GetPurchaseOrderList(fromDate, toDate, status: string) {
    return this.http.get<any>(`/api/Inventory/PurchaseOrders?fromDate=${fromDate}&toDate=${toDate}&status=${status}&storeId=${this._activateInventoryService.activeInventory.StoreId}`, this.options);
  }

  GetAllPOVerifiers() {
    return this.http.get<any>('/api/Inventory/POVerifiers', this.options);
  }
  //
  public GetPOlistVendorwise() {
    return this.http.get<any>('/api/Inventory/VendorWisePurchaseOrders', this.options);
  }
  //GET: GET purchase order Items by Purchase Order Id
  public GetPurchaseOrderItemsByPOId(purchaseOrderId: number) {
    return this.http
      .get<any>(`/api/Inventory/PurchaseOrderItemByPOId?purchaseOrderId=${purchaseOrderId}`, this.options);
  }
  //GET: Get ItemList
  public GetItemList() {
    return this.http.get<any>(`/api/Inventory/Items`, this.options);
  }
  public GetItemListByStoreId(storeId: number) {
    return this.http.get<any>(`/api/Inventory/ItemsByStoreId?storeId=${storeId}`, this.options);
  }

  //GET: Get ItemList
  public GetRFQItemsList(reqForQuotationId: number) {
    return this.http.get<any>(`/api/Inventory/RequestForQuotationItems?reqForQuotationId=${reqForQuotationId}`, this.options);
  }
  //GET: Get RFQ VendorList
  public GetRFQVendorsList(reqForQuotationId: number) {
    return this.http.get<any>(`/api/Inventory/RequestForQuotation?reqForQuotationId=${reqForQuotationId}`, this.options);
  }

  //GET: Get viewFilesList
  public loadQuotationAttachedFiles(RFQId) {
    return this.http.get<any>(`/api/Inventory/AttachedQuotationFiles?reqForQuotationId=${RFQId}`, this.options);
  }
  //GET: Get viewFilesList
  public getPreviousQuotationDetailsByVendorId(reqForQuotationId, vendorId) {
    return this.http.get<any>(`/api/Inventory/GetPreviousQuotationDetailsByVendorId?reqForQuotationId=${reqForQuotationId}&vendorId=${vendorId}`, this.options);
  }

  //GET: Get VendorList
  public GetVendorList() {
    return this.http.get<any>('/api/Inventory/Vendors', this.options);
  }
  //GET: Get CreditNoteNo
  public GetCreditNoteNum() {
    return this.http.get<any>('/api/Inventory/CreditNoteNo', this.options);
  }
  //GET: Get TermsList
  public GetTermsList(termsApplicationId: number) {
    return this.http.get<any>(`/api/InventorySettings/TermsListByTermsApplicationId?termsApplicationId=${termsApplicationId}`, this.options);
  }
  //Get:Requistion  update for item
  public GetToRequistion(requisitionId) {
    return this.http.get<any>(`/api/Inventory/RequisitionsByRequisitionId?requisitionId=${requisitionId}`, this.options);
  }
  //GET: Getting Requisition items for creating PO
  public GetRequisitionforPO() {
    return this.http.get<any>('/api/Inventory/RequisitionsforPO', this.options);
  }
  public GetItemwiseRequistionList() {
    return this.http.get<any>("/api/Inventory/ItemWiseRequistion", this.options);
  }

  public GetVendorItemReturnList() {
    return this.http.get<any>(`/api/Inventory/ReturnVendorItems?storeId=${this._activateInventoryService.activeInventory.StoreId}`, this.options);
  }

  public GetWriteOffItemList() {
    return this.http.get<any>("/api/Inventory/WriteOffItems", this.options);
  }

  //GET: getting vendor accodring the vendorid
  public GetVendorDetailsByVendorId(vendorId: number) {
    return this.http.get<any>(`/api/Inventory/VendorDetailsByVendorId?vendorId=${vendorId}`, this.options);
  }

  public GetVendorDetails() {
    return this.http.get<any>("/api/Inventory/VendorsDetail", this.options);
  }

  //GET: Get Requisition and Requisition Items with Stock Records for Dispatch Items
  public GetRequisitionWithRItemsById(requisitionId: number) {
    return this.http.get<any>(`/api/Inventory/RequisitionByRequisitionId?requisitionId=${requisitionId}`, this.options);
  }
  //GET: get all requisition items by ItemId for Dispatch-All purpose
  public GetRequisitionItemsbyItemId(itmId: number) {
    return this.http.get<any>(`/api/Inventory/RequisitionByItemId?itemId=${itmId}`, this.optionsJson);
  }
  //GET: Dept wise Requisition List by Status
  public GetAllSubstoreRequistionList(fromDate: string, toDate: string) {
    return this.http.get<any>(`/api/Inventory/SubstoreRequistions?fromDate=${fromDate}&toDate=${toDate}&storeId=${this._activateInventoryService.activeInventory.StoreId}`, this.optionsJson);
  }
  //GET: Dept wise Requisition List by Status
  public GetSubstoreRequistionList(fromDate: string, toDate: string, storeId: number) {
    return this.http.get<any>(`/api/Inventory/SubstoreRequistionList?fromDate=${fromDate}&toDate=${toDate}&storeId=${storeId}`, this.optionsJson);
  }

  //GET: Department details by requisition id
  public GetDepartmentDetailByRequisitionId(requisitionId: number) {
    return this.http.get<any>(`/api/Inventory/Department?requisitionId=${requisitionId}`, this.options);
  }

  //GET:Requisition List by Status
  public GetRequisitionList(status: string, itemId) {
    return this.http.get<any>(`/api/Inventory/Requisitions?status=${status}&itemId=${itemId}`, this.options);
  }
  //GET: STOCK : get all stock quantity details
  public GetStockList() {
    return this.http.get<any>(`/api/Inventory/Stocks?storeId=${this._activateInventoryService.activeInventory.StoreId}`);
  }
  public GetStockListForManage() {
    return this.http.get<any>(`/api/Inventory/StocksForManage?storeId=${this._activateInventoryService.activeInventory.StoreId}`);
  }
  public GetStockListForDirectDispatch(storeId) {
    return this.http.get<any>(`/api/Inventory/StockListForDirectDispatch?storeId=${storeId}`);
  }
  //GET: STOCK : get stock details by ItemId
  public GetStockDetailsByItemId(itemId, storeId) {
    return this.http.get<any>(`/api/Inventory/StocksByItemIdAndStoreId?itemId=${itemId}&storeId=${storeId}`, this.options);
  }
  //GET: STOCK : get stock manage by ItemId
  public GetStockManageByItemId(itemId, storeId) {
    return this.http.get<any>(`/api/Inventory/StocksManageByItemIdStoreId?itemId=${itemId}&storeId=${storeId}`, this.options);
  }
  //GET: Internal : get item list by VendorId for ReturnToVendor
  public GetItemListForReturnToVendor(vendorId, goodsReceiptNo, fiscYrId, storeId) {
    return this.http.get<any>(`/api/Inventory/ItemsForReturnToVendor?vendorId=${vendorId}&goodsreceiptNo=${goodsReceiptNo}&fiscalYearId=${fiscYrId}&storeId=${storeId}`, this.options);
  }
  //GET: External : get all goods receipt list
  public GetGoodsReceiptList(fromDate, toDate) {
    return this.http.get<any>(`/api/Inventory/GoodsReceipt?fromDate=${fromDate}&toDate=${toDate}&storeId=${this._activateInventoryService.activeInventory.StoreId}`, this.options);
  }
  public getGoodsReceiptMasterList() {
    return this.http.get<any>(`/api/Inventory/GoodsReceiptMasterList?storeId=${this._activateInventoryService.activeInventory.StoreId}`, this.options);
  }

  //GET: External : get all goods receipt list
  public GetGoodsReceiptStockList(fromDate, toDate) {
    return this.http.get<any>(`/api/Inventory/GoodsReceipStocks?fromDate=${fromDate}&toDate=${toDate}&storeId=${this._activateInventoryService.activeInventory.StoreId}`, this.options);
  }

  //GET: External : get all  fixed asset donation list
  public GetFixedAssetDonationList() {
    return this.http.get<any>("/api/Inventory/FixedAssetDonations");
  }

  public GetVendorsDetailsList() {
    return this.http.get<any>("/api/Inventory/GoodsReceiptByEachVendor");
  }
  public GetEachVendorDetailsList(VendorId) {
    return this.http.get<any>("/api/Inventory?reqType=GoodsReceiptItemId&vendorId=" + VendorId);
  }

  //GET: External : get all goods receipt items by goodsReceiptId
  public GetGRItemsByGRId(goodsReceiptId) {
    return this.http.get<any>(`/api/Inventory/GoodsReceiptByGRId?goodsReceiptId=${goodsReceiptId}`, this.options);
  }
  public GetGRItemsWithAvailableQtyByGRId(goodsReceiptId) {
    return this.http.get<any>(`/api/Inventory/GRItemsDetails?goodsReceiptId=${goodsReceiptId}&storeId=${this._activateInventoryService.activeInventory.StoreId}`, this.options);
  }
  //GET: External : get procurement goods receipt items by goodsReceiptId
  public GetProcurementGRView(goodsReceiptId) {
    return this.http.get<any>(`/api/Inventory/ProcurementGRView?goodsReceiptId=${goodsReceiptId}`, this.options);
  }

  //GET: get purchase order details by purchase order ID
  public GetPOItemsByPOId(purchaseOrderId) {
    return this.http.get<any>(`/api/Inventory/PurchaseOrderItem?purchaseOrderId=${purchaseOrderId}&storeId=${this._activateInventoryService.activeInventory.StoreId}`, this.options);
  }
  public getQuotationDetailsToAddPO(reqForQuotationId: number) {
    return this.http.get<any>(`/api/Inventory/QuotationDetailsToAddPO?reqForQuotationId=${reqForQuotationId}`, this.options);
  }

  //Get: Single Requisition Details (RequisitionItems) by RequisitionId for View
  public GetRequisitionItemsByRID(requisitionId: number) {
    return this.http.get<any>(`/api/Inventory/RequisitionItemsForView?requisitionId=${requisitionId}`);
  }

  //Get: Single Requisition Details (RequisitionItems) by RequisitionId for View  -- sud-19Feb'20
  public GetRequisitionItemsForViewByReqId(requisitionId: number) {
    return this.http.get<any>(`/api/Inventory/RequisitionItemForView?requisitionId=${requisitionId}`);
  }

  public GetDispatchDetails(requisitionId: number) {
    return this.http.get<any>(`/api/Inventory/DispatchView?requisitionId=${requisitionId}`);
  }

  public GetCancelDetails(requisitionId: number) {
    return this.http.get<any>(`/api/Inventory/CancelledRequisitionDetail?requisitionId=${requisitionId}`);
  }
  public GetDispatchItemByDispatchId(dispatchId: number, requisitionId: number, createdOn?: string) {
    return this.http.get<any>(`/api/Inventory/DispatchViewByDispatchIdReqIdCreatedOn?dispatchId=${dispatchId}&requisitionId=${requisitionId}&createdOn=${createdOn}`);
  }
  //Get:Return items details
  public GetReturnItemList(createdOn: string, vendorId: number) {
    return this.http.get<any>(`/api/Inventory/ReturnItemDetails?createdOn=${createdOn}&vendorId=${vendorId}`);
  }
  //GET: getting vendor deatils and Item list according the vendorid
  public GetVendorDetailsAndItemListByVendorId(vendorId: number) {
    return this.http.get<any>('/api/Inventory?reqType=ItemListByVendorId&vendorId=' + vendorId, this.options);
  }
  //GET: getting BatchNo By ItemId
  public GetBatchNoByItemId(itemId: number, vendorId: number) {
    return this.http.get<any>('/api/Inventory?reqType=batchNoByItemIdAndVendorId&itemId=' + itemId + '&vendorId=' + vendorId, this.options);
  }
  //GET: Getiing requested quotation list 
  public GetRequestedQuotationList() {
    return this.http.get<any>("/api/Inventory/RequestedQuotations", this.options);
  }
  //GEt: Getting quotaion Details
  public GetQuotationDetails(reqForQuotationId: number) {
    return this.http.get<any>(`/api/Inventory/QuotationDetails?reqForQuotationId=${reqForQuotationId}`, this.options);
  }
  //GEt: Getting quotaion Details
  public GetPORequisition(fromDate, toDate) {
    return this.http.get<any>(`/api/Inventory/PurchaseOrderRequisition?fromDate=${fromDate}&toDate=${toDate}&storeId=${this._activateInventoryService.activeInventory.StoreId}`, this.options);
  }
  public GetPurchaseRequestById(RequisitionId) {
    return this.http.get<any>(`/api/Inventory/PORequisitionByRequisitionIdStoreId?requisitionId=${RequisitionId}&storeId=${this._activateInventoryService.activeInventory.StoreId}`, this.options);
  }
  public GetPurchaseRequestItemsById(purchaseRequestId) {
    return this.http.get<any>(`/api/Inventory/PurchaseRequestItems?purchaseRequestId=${purchaseRequestId}`, this.options);
  }
  public GetItemPriceHistory() {
    return this.http.get<any>('/api/Inventory/ItemPriceHistory', this.options);
  }
  GetActiveInventoryList() {
    return this.http.get<any>('/api/Inventory/ActiveInventories', this.options);
  }
  public GetAllInventoryFiscalYears() {
    return this.http.get<any>('/api/Inventory/InventoryFiscalYears', this.options);
  }
  //Get: Track Requisition by id
  public TrackRequisitionById(requisitionId) {
    return this.http.get<any>(`/api/Inventory/TrackRequisition?requisitionId=${requisitionId}`, this.options);
  }
  //GET:FiscalYears
  public GetAllFiscalYears() {
    return this.http.get<any>("/api/Billing/BillingFiscalYears");
  }
  public GetAvailableQuantityByItemId(itemId: number) {
    return this.http.get<any>(`/api/Inventory/AvailableQuantity?itemId=${itemId}&storeId=${this._activateInventoryService.activeInventory.StoreId}`);
  }
  //POST: Save Purchase Order
  public PostToPurchaseOrder(PurchaseOrderObjString: string) {
    let data = PurchaseOrderObjString;
    return this.http.post<any>("/api/Inventory/PurchaseOrder", data, this.optionsJson);
  }
  //POST: cancel purchase order
  public PostPurchaseOrderCancelDetail(purchaseOrderId, cancelRemarks) {
    try {
      return this.http.post<any>(`/api/Inventory/CancelPurchaseOrder?purchaseOrderId=${purchaseOrderId}&cancelRemarks=${cancelRemarks}`, this.options);
    } catch (ex) {
      throw ex;
    }
  }
  //POST: cancel Requisition
  public WithdrawRequisitionById(requisitionId, withdrawRemarks) {
    try {
      return this.http.post<any>(`/api/Inventory/WithdrawRequisition?requisitionId=${requisitionId}&withdrawRemarks=${withdrawRemarks}`, this.optionsJson);
    } catch (ex) {
      throw ex;
    }
  }
  //POST: cancel Requisition
  public WithdrawPurchaseRequestById(purchaseRequestId, CancelRemarks) {
    try {
      return this.http.post<any>(`/api/Inventory/WithdrawPurchaseRequest?purchaseRequestId=${purchaseRequestId}`, CancelRemarks, this.optionsJson);
    } catch (ex) {
      throw ex;
    }
  }
  //88888
  PostGoodsReceiptCancelDetail(goodsReceiptId, CancelRemarks) {
    try {
      return this.http.post<any>(`/api/Inventory/CancelGoodsReceipt?goodsReceiptId=${goodsReceiptId}`, CancelRemarks, this.optionsJson);
    } catch (ex) {
      throw ex;
    }
  }
  public UpdatePurchaseOrder(PurchaseOrderObjString: string) {
    let data = PurchaseOrderObjString;
    return this.http.put<any>("/api/Inventory/PurchaseOrder", data, this.options);
  }
  //POST: Save Purchase Order Requisition
  public PostToPORequisition(PORequisitionObjString: string) {
    let data = PORequisitionObjString;
    return this.http.post<any>("/api/Inventory/PORequisition", data, this.options);

  }
  //POST: Save RequestForQuotation
  public PostToReqForQuotation(ReqForQuotationObjString: string) {
    let data = ReqForQuotationObjString;
    return this.http.post<any>("/api/Inventory/ReqForQuotation", data, this.options);

  }
  //POST:Save dispatched Items to database
  public PostToDispatchItems(DispatchItemsObjString: string) {
    let data = DispatchItemsObjString;
    return this.http.post<any>("/api/Inventory/Dispatch", data, this.options);
  }
  //Save Post To Requisition
  public PostToRequisition(requisiton: Requisition) {
    return this.http.post("/api/Inventory/Requisition", requisiton, this.optionsJson);
  }
  //Save Goods Receipt
  public PostDirectDispatch(dispatchItemsObj: string, fromRoute: string) {
    let data = dispatchItemsObj;
    return this.http.post<any>(`/api/Inventory/DirectDispatch?fromRoute=${fromRoute}`, data, this.optionsJson);
  }
  //Save Return to vendor Item
  public PostToReturnToVendor(ReturnToVendorObjString: string) {
    let data = ReturnToVendorObjString;
    return this.http.post<any>("/api/Inventory/ReturnToVendor", data, this.options);
  }

  public PostQuotationDetails(QuotatationItemsString: any) {
    let data = QuotatationItemsString;
    return this.http.post<any>("/api/Inventory/PostQuotations", data, this.options);
  }

  //POST: Save Write-Off Items
  public PostToWriteOffItems(WriteOffItemsObjString: string) {
    let data = WriteOffItemsObjString;
    return this.http.post<any>("/api/Inventory/WriteOffItem", data, this.options);
  }

  public PostQuotationFiles(formData: any) {
    try {
      return this.http.post<any>("/api/Inventory/UploadQuotationFiles", formData);
    } catch (exception) {
      throw exception;
    }
  }
  //PUT:

  //PUT:Update Purchase order and Purchase Order Items Status after Goods Receipt Generation
  UpdatePOAndPOItemStatus(PurchaseOrderObjString: string) {

    let data = PurchaseOrderObjString;
    return this.http.put<any>("/api/Inventory/PurchaseOrderAndPOItemStatus", data, this.options);
  }

  //PUT:Update Purchase order and Purchase Order Items Status after Goods Receipt Generation
  UpdateRequisitionStatus(ReqObjString: string) {

    let data = ReqObjString;
    return this.http.put<any>("/api/Inventory/RequisitionStatus", data, this.options);
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
    return this.http.put<any>("/api/Inventory/StockManage", data, this.options);
  }
  UpdateVendorForPO(data) {
    return this.http.put<any>("/api/Inventory/VendorForPO", data, this.options);
  }
  public UpdatePORequisition(PORequisitionObjString: string) {
    let data = PORequisitionObjString;
    return this.http.put<any>("/api/Inventory/PORequisition", data, this.options);
  }
  public UpdatePORequisitionAfterPOCreation(reqId: number) {
    let data = reqId.toString();
    return this.http.put<any>("/api/Inventory/PORequisitionAfterPOCreation", data, this.options);

  }

  //Cancel remaining items 
  CancelRequisitionItems(data) {
    return this.http.put<any>("/api/Inventory/CancelRequisitionItem", data, this.options);
  }
  //GET : vendor's billing history (goods received)
  public GetGRVendorBillingHistory() {
    return this.http.get<any>('/api/Inventory/GRVendorsBillingHistory', this.options);
  }

  // public ReceiveGR(GoodsReceiptId) {
  //   return this.http.post<any>("/api/Inventory/ReceiveGoodsReceipt/", GoodsReceiptId);
  // }

  public ReceiveGR(GoodsReceiptId, receivedRemarks) {
    try {
      return this.http.post<any>(`/api/InventoryGoodReceipt/ReceiveGoodsReceipt/${GoodsReceiptId}?ReceivedRemarks=${receivedRemarks}`, this.options);
    } catch (ex) {
      throw ex;
    }
  }

  public GetSubCategoryList() {
    return this.http.get<any>(`/api/Inventory/SubCategories`);
  }

  // //GET: External : get all  fixed asset location list
  // public GetFixedAssetLocationList() {
  //   return this.http.get<any>("/api/inventory?reqType=getfixedassetlocations");
  // }
  UpdateReconciledStockFromExcelFile(data: any) {
    try {
      return this.http.post<any>("/api/Inventory/ReconciledStockFromExcelFile", data, this.options);
    } catch (ex) {
      throw ex;
    }
  }

  ExportStocksForReconciliationToExcel(storeId: number) {
    return this.http.get(`/api/Inventory/ExportStocksForReconciliationToExcel?storeId=${storeId}`, { responseType: 'blob' });
  }


  public GetItemByStoreId(ItemId: number, StoreId: number) {
    return this.http.get<any>("/api/Inventory/GetItem/" + ItemId + "/" + StoreId, this.options);
  }
  public GetAvailableQuantityByItemIdAndStoreId(itemId, storeId) {
    return this.http.get<any>(`/api/Inventory/AvailableQuantityByItemIdAndStoreId?itemId=${itemId}&storeId=${storeId}`, this.options);

  }
  public GetReturnItemsFromSubstore(fromdate: string, todate: string, targetstoreid: number, sourceSubstoreId: number) {
    return this.http.get<any>(`/api/inventory/ReturnFromSubtore?fromDate=${fromdate}&todate=${todate}&targetstoreid=${targetstoreid}&sourceSubstoreId=${sourceSubstoreId}`, this.options);

  }
  public GetAllSubstores() {
    return this.http.get<any>("/api/inventory/AllSubstore", this.options);

  }
  ReceiveRetunedItems(returnId: number, receivedRemarks: string) {
    return this.http.put<any>(`/api/inventory/ReceiveDispatchedItems?returnId=${returnId}&receivedRemarks=${receivedRemarks}`, this.options);
  }
  public PostToPurchaseOrderDraft(PurchaseOrderDraftObjString: string) {
    return this.http.post<any>("/api/Inventory/PurchaseOrderDraft", PurchaseOrderDraftObjString, this.optionsJson);
  }
  public GetPurchaseOrderDraftList(status: string) {
    return this.http.get<any>(`/api/Inventory/PurchaseOrderDrafts?status=${status}`, this.options);
  }
  public GetPurchaseOrderDraftById(purchaseOrderDraftId: number) {
    return this.http.get<any>(`/api/Inventory/PurchaseOrderDraftItem?purchaseOrderDraftId=${purchaseOrderDraftId}`, this.options);
  }
  public PostDiscardPurchaseOrderDraft(draftPurchaseOrderId, DiscardRemarks) {
    try {
      return this.http.post<any>(`/api/Inventory/DiscardPurchaseOrder?draftPurchaseOrderId=${draftPurchaseOrderId}&DiscardRemarks=${DiscardRemarks}`, this.optionsJson);
    } catch (ex) {
      throw ex;
    }
  }
  public UpdatePurchaseOrderDraft(purchaseOrderDraft: PurchaseOrderDraft) {
    return this.http.put<any>("/api/Inventory/PurchaseOrderDraft", purchaseOrderDraft, this.optionsJson);
  }
}
