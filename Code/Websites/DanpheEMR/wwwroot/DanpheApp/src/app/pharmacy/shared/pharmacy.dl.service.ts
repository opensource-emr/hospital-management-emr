import { Injectable, Directive } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { PHRMDepositModel } from '../../dispensary/dispensary-main/patient-main/patient-deposit-add/phrm-deposit.model';
import { store } from '@angular/core/src/render3';


@Injectable()
export class PharmacyDLService {
  public options = { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) };
  public optionJson = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  constructor(public http: HttpClient) {

  }
  public GetSettlementSummaryReport(FromDate,ToDate,StoreId){
    return this.http.get<any>("/PharmacyReport/SetlementSummaryReport?FromDate="
      + FromDate + "&ToDate=" + ToDate + "&StoreId=" + StoreId, this.options)
  }
  public GetPatientWiseSettlementSummaryReport(FromDate,ToDate,PatientId){
    return this.http.get<any>("/PharmacyReport/PatientWiseSettlementSummaryReport?FromDate="
      + FromDate + "&ToDate=" + ToDate +"&PatientId="+PatientId, this.options)
  }

  public GetPHRMPendingBillsForSettlement(storeId) {
    return this.http.get<any>(`/api/Pharmacy?reqType=pending-bills-for-settlements&storeId=${storeId}`);
  }
  public GetPHRMSettlements(storeId,FromDate,ToDate) {
    return this.http.get<any>("/api/Pharmacy?reqType=allPHRMSettlements&storeId="+storeId+"&FromDate="+FromDate+"&Todate="+ToDate);
  }
  // get pharmacy settlement duplicate records. 
  public GetPHRMSettlementDuplicatePrints() {
    return this.http.get<any>("/api/Pharmacy?reqType=settlements-duplicate-prints");
  }
  // get pharmacy settlement duplicate details using settlement id. 
  public GetPHRMSettlementDuplicateDetails(settlementId) {
    return this.http.get<any>("/api/Pharmacy?reqType=get-settlements-duplicate-details&settlementId=" + settlementId);
  }
  public GetCreditInvoicesByPatient(patientId: number) {
    return this.http.get<any>("/api/Pharmacy?reqType=unpaidInvoiceByPatientId" + "&patientId=" + patientId, this.options);
  }

  public GetPatientPastBillSummary(patientId: number) {
    return this.http.get<any>("/api/Pharmacy?reqType=patientPastBillSummary" + "&patientId=" + patientId, this.options);
  }
  public GetProvisionalItemsByPatientIdForSettle(patientId: number) {
    return this.http.get<any>("/api/Pharmacy?reqType=provisionalItemsByPatientIdForSettle" + "&patientId=" + patientId, this.options);
  }
  public GetCreditOrganizationList() {
    return this.http.get<any>("/api/Pharmacy?reqType=get-credit-organizations");
  }
  //GET: setting-supplier manage : list of suppliers
  public GetSupplierList() {
    return this.http.get<any>("/api/Pharmacy?reqType=supplier");
  }
  public GetAllSupplierList() {
    return this.http.get<any>("/api/Pharmacy?reqType=allSupplier");
  }

  public GetCounter() {
    return this.http.get<any>('/api/pharmacy?reqType=getCounter', this.options);
  }
  public ActivatePharmacyCounter(counterId: number, counterName: string) {
    return this.http.put<any>("/api/Security?reqType=activatePharmacyCounter&counterId=" + counterId + "&counterName=" + counterName, this.options);
  }
  public DeActivatePharmacyCounter() {
    return this.http.put<any>("/api/Security?reqType=deActivatePharmacyCounter", this.options);
  }

  //GET: getting vendor accodring the vendorid
  public GetSupplierDetailsBySupplierId(supplierId: number) {
    return this.http.get<any>("/api/Pharmacy?reqType=SupplierDetails&supplierId=" + supplierId, this.options);
  }
  //GET: setting-itemtype manage : List of itemtypes
  public GetItemTypeList() {
    return this.http.get<any>('/api/Pharmacy?reqType=itemtype', this.options);
  }
  //GET: setting-packingtype  : List of packingtypes
  public GetPackingTypeList() {
    return this.http.get<any>('/api/Pharmacy?reqType=GetPackingType', this.options);
  }
  //GET: setting- item manage: list of itemtypes
  public GetItemTypeListManage() {
    return this.http.get<any>('/api/Pharmacy?reqType=GetItemType', this.options);
  }
  //GET: List of ItemTypes with all Child Items Master data
  public GetItemTypeListWithItems(dispensaryId?) {
    try {
      return this.http.get<any>('/api/Pharmacy?reqType=itemtypeListWithItems&DispensaryId=' + dispensaryId, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }

  public GetRackByItem(itemId) {
    try {
      return this.http.get<any>('/api/Pharmacy?reqType=GetRackByItem&itemId=' + itemId, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  //GET: setting-company manage : list of companies
  public GetCompanyList() {
    return this.http.get<any>("/api/Pharmacy?reqType=company");
  }

  //GET: setting-category manage : list of categories
  public GetCategoryList() {
    return this.http.get<any>("/api/Pharmacy?reqType=category");
  }
  ///GET: get ItemList by ItemTypeId
  public GetItemListByItemTypeId(itemTypeId) {
    return this.http.get<any>("/api/Pharmacy?reqType=GetItemListByItemTypeId&itemTypeId=" + itemTypeId, this.options);
  }
  public GetStockForItemDispatch() {
    return this.http.get<any>("/api/Pharmacy/GetStockForItemDispatch");
  }


  //GET: setting-unit of measurement manage : list of unit of measurements
  public GetUnitOfMeasurementList() {
    return this.http.get<any>("/api/Pharmacy?reqType=unitofmeasurement");
  }
  //GET: setting-item manage : list of items
  public GetItemList() {
    return this.http.get<any>("/api/Pharmacy?reqType=item");
  }
  //Get Only Master Items
  public GetItemMasterList() {
    return this.http.get<any>("/api/Pharmacy?reqType=GetAllItems");
  }
  //GET: Get Store Details
  public GetActiveStore() {
    return this.http.get<any>("/api/PharmacyReport/GetActiveStores");
  }
  //GET: setting-tax manage : list of tax
  public GetTAXList() {
    return this.http.get<any>("/api/Pharmacy?reqType=tax");
  }
  public GetGenericList() {
    return this.http.get<any>("/api/Pharmacy?reqType=getGenericList");
  }

  //GET:patient List from Patient controller
  public GetPatients(searchTxt: string = '', isInsurance: boolean = false) {
    // return this.http.get<any>("/api/Patient", this.options);
    return this.http.get<any>(`/api/Pharmacy/GetPatientList?SearchText=${searchTxt}&IsInsurance=${isInsurance}`, this.options);
  }
  public GetPatientsListForSaleItems(isInsurnaceDispensary) {
    return this.http.get<any>(`/api/Pharmacy/GetPharmacySalePatient/${isInsurnaceDispensary}`, this.options);
  }
  //GET:deposit
  public GetDeposit() {
    return this.http.get<any>("", this.options);
  }
  //GET: Patient List with matching info like firstname, lastname and phone number for checking existed patient or not
  //This call to Visit Controller for code reuseability because this method logic written in Visit controller
  public GetExistedMatchingPatientList(firstName, lastName, phoneNumber) {
    try {
      return this.http.get<any>("/api/Patient?reqType=GetMatchingPatList&FirstName="
        + firstName +
        "&LastName=" + lastName +
        "&PhoneNumber=" + phoneNumber,
        this.options);
    }
    catch (ex) {
      throw ex;
    }
  }

  //GET: STOCK : get stock manage by ItemId
  public GetStockManageByItemId(ItemId) {
    try {
      return this.http.get<any>("/api/Pharmacy?reqType=stockManage&itemId=" + ItemId, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }

  ///GET: POList by Passing Status 
  public GetPHRMPurchaseOrderList(status: string, fromDate: string, toDate: string) {
    return this.http.get<any>("/api/Pharmacy?reqType=getPHRMOrderList&status=" + status + "&FromDate=" + fromDate + "&ToDate=" + toDate, this.options)
  }
  ///GET: POItemsList By Passing PurchaseOrderId
  public GetPHRMPOItemsByPOId(purchaseOrderId) {
    return this.http.get<any>("/api/Pharmacy?reqType=getPHRMPOItemsByPOId&purchaseOrderId=" + purchaseOrderId, this.options)
  }

  //GET: Provisional Items List
  public GetPHRMProvisionalItemList(status: string) {
    return this.http.get<any>("/api/Pharmacy?reqType=get-provisional-items&status=" + status, this.options)
  }

  //GET: All Provisional Items List
  public GetAllPHRMProvisionalItemList() {
    return this.http.get<any>("/api/Pharmacy?reqType=get-all-provisional-items", this.options)
  }

  //GET: Requsted drug-list by patientId and VisitId (used in Emergency) --added by Anish 25 Feb Anish
  public GetAllDrugOrderOfERPatient(patientId: number, visitId: number) {
    return this.http.get<any>("/api/Pharmacy?reqType=get-all-drugs-order&patientId=" + patientId + "&visitId=" + visitId, this.options)
  }

  //GET: drigs Items List
  public GetPHRMDrugsItemList(requisitionId) {
    return this.http.get<any>("/api/Pharmacy?reqType=get-drugs-request-items&requisitionId=" + requisitionId, this.options)
  }

  // GET: drug dispatch list per nursing requisition
  public GetPHRMDrugDispatchList(requisitionId) {
    return this.http.get<any>("/api/Pharmacy?reqType=get-drugs-dispatch-items&requisitionId=" + requisitionId, this.options)
  }

  ////GET: PhrmPurchaseOrderItems List for GR
  public GetPHRMPOItemsForGR(purchaseOrderId) {
    return this.http.get<any>("/api/Pharmacy?reqType=getPHRMPOItemsForGR&purchaseOrderId=" + purchaseOrderId, this.options)
  }
  ///GET: Get Return To SupplierItem by ReturnToSupplierId
  public GetReturnToSupplierItemsByRetSuppId(returnToSupplierId) {
    return this.http.get<any>("/api/Pharmacy?reqType=getReturnToSupplierItemsByReturnToSupplierId&returnToSupplierId=" + returnToSupplierId, this.options)
  }

  ///GET: Get Return To SupplierItem of Goodreceipt from GR
  public GetReturnToSupplierItemsofExistingGR() {
    // return this.http.get<any>("/api/Pharmacy?reqType=getReturnToSu=" + returnToSupplierId, this.options)
    return this.http.get<any>("/api/GetCreditNoteItems", this.options);
  }

  ///GET: Get Write Off Items By WriteOffId
  public GetWriteOffItemsByWriteOffId(writeOffId) {
    try {
      return this.http.get<any>("/api/Pharmacy?reqType=getWriteOffItemsByWriteOffId&writeOffId=" + writeOffId, this.options)
    }
    catch (ex) {
      throw ex;
    }
  }
  //GET: order-goods receipt list
  public GetGoodsReceiptList() {
    return this.http.get<any>("/api/Pharmacy?reqType=goodsreceipt");
  }
  //Get GR List with Date Filtered
  GetDateFilteredGoodsReceiptList(fromDate: string, toDate: string) {
    return this.http.get<any>("/api/Pharmacy/GetDateFilteredGoodsReceiptList?FromDate=" + fromDate + "&ToDate=" + toDate, this.optionJson);
  }

  public GetAccountDetailsList() {
    return this.http.get<any>("/api/Pharmacy?reqType=get-goods-receipt-groupby-supplier");
  }

  public GetEachAccountDetailsList(SupplierID) {
    return this.http.get<any>("/api/Pharmacy?reqType=get-goods-receipt-by-SupplierID&providerId=" + SupplierID);
  }
  //Get : all the stroe list
  public GetMainStore() {
    return this.http.get<any>("/api/Pharmacy?reqType=getMainStore");
  }
  //Get : all the main store stock
  public GetMainStoreStock(showAllStock: boolean = false) {
    return this.http.get<any>(`/api/Pharmacy/GetMainStoreStock/${showAllStock}`);
  }
  //Get : all the unconfirmed stock for main store
  public GetMainStoreIncomingStock(fromDate, toDate) {
    return this.http.get<any>("/api/Pharmacy/GetMainStoreIncomingStock?FromDate=" + fromDate + "&ToDate=" + toDate, this.optionJson);
  }
  //receiveIncomingStock
  ReceiveIncomingStock(dispatchId: number, receivingRemarks: string) {
    var remarks = JSON.stringify(receivingRemarks);
    return this.http.put<any>(`/api/Pharmacy/ReceiveIncomingStock/${dispatchId}`, remarks, this.optionJson);
  }
  ///GET: Return  To Supplier
  public GetReturnToSupplier(suppId?, grNo?, invcId?, fromDate?, toDate?) {
    return this.http.get<any>("/api/Pharmacy?reqType=returnToSupplier&supplierId=" + suppId + "&gdprintId=" + grNo + "&invoiceNo=" + invcId + "&FromDate=" + fromDate + "&ToDate=" + toDate, this.options);
  }

  ///GET: Return Items To Supplier List
  public GetReturnItemsToSupplierList(fromDate, toDate) {
    return this.http.get<any>("/api/Pharmacy?reqType=returnItemsToSupplierList&FromDate=" + fromDate + "&ToDate=" + toDate, this.options);
  }

  ///////here
  //public GetPharmacyInvoiceDetailsByInvoiceId(invoiceId: number) {
  //    return this.http.get<any>("/api/Pharmacy?reqType=getInvoiceDetailsByInvoiceId" + "&invoiceId=" + invoiceId, this.options);
  //}

  //GET: WriteOff List With SUM of Toatal WriteOff Qty
  public GetWriteOffList() {
    try {
      return this.http.get<any>("/api/Pharmacy?reqType=getWriteOffList");
    }
    catch (ex) {
      throw ex;
    }
  }
  ////Get Stock Details List
  public GetStockDetailsList(dispensaryId?) {
    return this.http.get<any>("/api/Pharmacy?reqType=itemtypeListWithItems&DispensaryId=" + dispensaryId);
  }

  ////Get Narcotics Stock Details List(sales)
  public GetNarcoticsStockDetailsList() {
    return this.http.get<any>("/api/Pharmacy?reqType=natcoticsstockDetails");
  }
  public GetSalesDetailsList() {
    return this.http.get<any>("/api/Pharmacy?reqType=stockDetails");
  }

  // Get items List
  public GetItemsList() {
    return this.http.get<any>("/api/Pharmacy?reqType=item");
  }
  // Get only the item Name List
  public getOnlyItemNameList() {
    return this.http.get<any>("/api/PharmacyReport/getOnlyItemNameList");
  }
  public getItemListForManualReturn() {
    return this.http.get<any>("/api/pharmacy/getItemListForManualReturn");
  }
  public getAvailableBatchesByItemId(itemId: number) {
    return this.http.get<any>(`/api/pharmacy/getAvailableBatchesByItemId/${itemId}`);
  }
  //Get: Get Users for Return from Customer Report.

  public getPharmacyUsers() {
    return this.http.get<any>("/api/PharmacyReport/GetPharmacyUsersForReturnFromCustomerReport");
  }
  //GET: Get Return From Customer Report.
  public getReturnFromCustomerReport(userId, dispensaryId, fromDate, toDate) {
    try {
      return this.http.get<any>("/PharmacyReport/ReturnFromCustomerReport?fromDate=" + fromDate + "&toDate=" + toDate + "&userId=" + userId + "&dispensaryId=" + dispensaryId, this.options);
    }
    catch (ex) { throw ex; }

  }

  //GET: Get Sales Statement Report
  public getSalesStatementReport(fromDate, toDate) {
    try {
      return this.http.get<any>(`/PharmacyReport/SalesStatementReport?FromDate=${fromDate}&ToDate=${toDate}`, this.options);
    }
    catch (ex) { throw ex; }
  }

  //GET: Get Sales Summary
  public getSalesSummaryReport(fromDate, toDate) {
    try {
      return this.http.get<any>(`/PharmacyReport/SalesSummaryReport?FromDate=${fromDate}&ToDate=${toDate}`, this.options);
    }
    catch (ex) { throw ex; }
  }

  //GET: Get Purchase Summary
  public getPurchaseSummaryReport(fromDate, toDate) {
    try {
      return this.http.get<any>(`/PharmacyReport/PurchaseSummaryReport?FromDate=${fromDate}&ToDate=${toDate}`, this.options);
    }
    catch (ex) { throw ex; }
  }

  //GET: Get Purchase Summary
  public getStockSummarySecondReport(tillDate) {
    try {
      return this.http.get<any>(`/PharmacyReport/StockSummarySecondReport?TillDate=${tillDate}`, this.options);
    }
    catch (ex) { throw ex; }
  }

  //GET: Get Ins Patient Report
  public getInsPatientBimaReport(fromDate, toDate, counterId, userId, claimCode, nshiNumber) {
    try {
      return this.http.get<any>(`/PharmacyReport/InsurancePatientBimaReport?FromDate=${fromDate}&ToDate=${toDate}&CounterId=${counterId}&UserId=${userId}&ClaimCode=${claimCode}&NSHINumber=${nshiNumber}`, this.options);
    }
    catch (ex) { throw ex; }
  }

  //GET: Get Patient Sales Detail Report
  public getPatientSalesDetailReport(fromDate, toDate, patientId, counterId, userId, storeId) {
    try {
      return this.http.get<any>(`/PharmacyReport/PatientSalesDetailReport?FromDate=${fromDate}&ToDate=${toDate}&PatientId=${patientId}&CounterId=${counterId}&UserId=${userId}&StoreId=${storeId}`, this.options);
    }
    catch (ex) { throw ex; }
  }

  ////Get:  Get Daily Sales Summary Report Data test
  public GetDailySalesSummaryReport(FromDate, ToDate, itemId, storeId, counterId, userId) {
    try {
      return this.http.get<any>(`/PharmacyReport/PHRMDailySalesReport?FromDate=${FromDate}&ToDate=${ToDate}&itemId=${itemId}&storeId=${storeId}&CounterId=${counterId}&UserId=${userId}`, this.options);
    }
    catch (ex) { throw ex; }

  }
  //GET:  Get Item Wise Purchase Report Data
  public GetItemWisePurchaseReport(FromDate, ToDate, itemId, invoiceNo?, grNo?, supplierId?) {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMItemWisePurchaseReport?FromDate=" + FromDate + "&ToDate=" + ToDate + "&itemId=" + itemId + "&invoiceNo=" + invoiceNo + "&grNo=" + grNo + "&supplierId=" + supplierId, this.options);
    }
    catch (ex) { throw ex; }

  }
  //GET:  Get Stock Transfers Report Data
  public getStockTransfersReport(FromDate, ToDate, itemId, sourceStoreId, targetStoreId, notReceivedStocks) {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMStockTransfersReport?FromDate=" + FromDate + "&ToDate=" + ToDate + "&itemId=" + itemId + "&sourceStoreId=" + sourceStoreId + "&targetStoreId=" + targetStoreId + "&notReceivedStocks=" + notReceivedStocks, this.options);
    }
    catch (ex) { throw ex; }

  }
  //GET:  Get Supplier Wise Stock Report Data
  public getSupplierWiseStockReport(FromDate, ToDate, itemId, storeId, supplierId) {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMSupplierWiseStockReport?FromDate=" + FromDate + "&ToDate=" + ToDate + "&itemId=" + itemId + "&storeId=" + storeId + "&supplierId=" + supplierId, this.options);
    }
    catch (ex) { throw ex; }

  }


  ///// get Daliy Salse Report for Narcotics Date
  public GetNarcoticsDailySalesReport(FromDate, ToDate, itemId, storeId) {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMNarcoticsDailySalesReport?FromDate=" + FromDate + "&ToDate=" + ToDate + "&itemId=" + itemId + "&storeId=" + storeId, this.options);
    }
    catch (ex) { throw ex; }

  }

  ////Get:  Get ABCVED Summary Report Data test
  public GetPHRMABCVEDStockReport(Status) {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMABCVEDStockReport?Status=" + Status, this.options);
    }
    catch (ex) { throw ex; }

  }
  //GET: order-goods receipt items-view by GR-Id
  public GetGRItemsByGRId(goodsReceiptId) {
    return this.http.get<any>("/api/Pharmacy?reqType=GRItemsViewByGRId&goodsReceiptId=" + goodsReceiptId, this.options);
  }
  //GET:purchase order-items -view by PO-ID
  public GetPODetailsByPOID(purchaseOrderId) {
    return this.http.get<any>(`/api/Pharmacy/GetPODetailsByPOID/${purchaseOrderId}`, this.options);
  }
  //GET: order-goods receipt items-view by GR-Id
  public GetGRItemsForEdit(goodsReceiptId) {
    return this.http.get<any>("/api/Pharmacy?reqType=GRforEdit&goodsReceiptId=" + goodsReceiptId, this.options);
  }
  ///GET: GetBatchNo List By ItemId
  public GetBatchNoByItemId(ItemId) {
    try {
      return this.http.get<any>("/api/Pharmacy?reqType=getBatchNoByItemId&itemId=" + ItemId, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  ///GET: Get Item Details By passing BatchNo 
  public GetItemDetailsByBatchNo(BatchNo, ItemId) {
    try {
      return this.http.get<any>("/api/Pharmacy?reqType=getItemDetailsByBatchNo&batchNo=" + BatchNo + "&ItemId=" + ItemId, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  ////GET: Get Purchase Order Report
  public GetPHRMPurchaseOrderReport(phrmReports) {
    return this.http.get<any>("/PharmacyReport/PHRMPurchaseOrderReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate + "&Status=" + phrmReports.Status, this.options)
  }

  ////GET: Get User Report
  public GetPHRMUserwiseCollectionReport(phrmReports) {
    return this.http.get<any>("/PharmacyReport/PHRMUserwiseCollectionReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate + "&CounterId=" + phrmReports.CounterId + "&CreatedBy=" + phrmReports.CreatedBy + "&StoreId=" + phrmReports.StoreId, this.options)
  }

  ////GET: Get Cash Collection Summary Report
  public GetPHRMCashCollectionSummaryReport(phrmReports) {
    return this.http.get<any>("/PharmacyReport/PHRMCashCollectionSummaryReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate + "&StoreId=" + phrmReports.StoreId, this.options)
  }

  ////GET: Get Sale Return Report
  public GetSaleReturnReport(phrmReports) {
    return this.http.get<any>("/PharmacyReport/PHRMSaleReturnReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options)
  }


  ////GET: Get Counterwise Report
  public GetPHRMCounterwiseCollectionReport(phrmReports) {
    return this.http.get<any>("/PharmacyReport/PHRMCounterwiseCollectionReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options)
  }

  ////GET: Get Breakage Items Details Report
  public GetPHRMBreakageItemReport(phrmReports) {
    return this.http.get<any>("/PharmacyReport/PHRMBreakageItemReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options)
  }

  ////GET: Get Return To Supplier Details Report
  public GetPHRMReturnToSupplierReport(phrmReports) {
    return this.http.get<any>("/PharmacyReport/PHRMReturnToSupplierReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options)
  }
  ////GET: Get Transer To Store Report
  public GetPHRMTransferToStoreReport(phrmReports) {
    return this.http.get<any>("/PharmacyReport/PHRMTransferToStoreReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options)
  }
  ////GET: Get Transer To Dispensary Report
  public GetPHRMTransferToDispensaryReport(phrmReports) {
    return this.http.get<any>("/PharmacyReport/PHRMTransferToDispensaryReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options)
  }

  ////GET: Get Goods Receipt Product Report
  public GetPHRMGoodsReceiptProductReport(phrmReports, itemId) {
    return this.http.get<any>("/PharmacyReport/PHRMGoodsReceiptProductReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate + "&ItemId=" + itemId, this.options)
  }

  ////GET:  Get Drug Category Wise Report
  public GetPHRMDrugCategoryWiseReport(phrmReports, category) {
    return this.http.get<any>("/PharmacyReport/PHRMDrugCategoryWiseReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate + "&category=" + category, this.options)
  }

  //GET : Get stock manage details report
  public GetPHRMStockManageDetailReport(phrmReports) {
    try {
      return this.http.get<any>("/PharmacyReport/StockManageReport?FromDate="
        + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options)
    }
    catch (ex) {
      throw ex;
    }

  }

  //Get : Get Deposit Balance Report
  public GetPHRMDepositBalanceReport() {
    try {
      return this.http.get<any>("/PharmacyReport/DepositBalanceReport", this.options)
    }
    catch (ex) {
      throw ex;
    }

  }


  ////GET: Get Itemwise stock Report  
  public GetPHRMDispensaryStoreReport(phrmReports) {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMDispensaryStoreStockReport?Status=" + phrmReports.Status, this.options)
    }
    catch (ex) {
      throw ex;
    }
  }
  ///Get Narcotics Items stock details for sales report
  public GetPHRMNarcoticsStoreReport() {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMNarcoticsDispensaryStoreStockReport", this.options)
    }
    catch (ex) {
      throw ex;
    }
  }
  ////GET: GET ItemList For Return Function Whose Available Qty is greater then zero
  public GetItemListWithTotalAvailableQty() {
    return this.http.get<any>("/api/Pharmacy?reqType=PHRMItemListWithTotalAvailableQuantity", this.options)
  }
  //GET: Get all doctors list    
  //we are taking employe
  public GetDoctorList() {
    return this.http.get<any>("/api/Master?type=departmentemployee&reqType=appointment", this.options);
  }

  public GetPatientSummary(patientId: number) {
    return this.http.get<any>("/api/Pharmacy?reqType=patientSummary" + "&patientId=" + patientId, this.options);
  }


  //GET: Prescription List group by PatientName, DoctorName and CreatedDate
  public GetPrescriptionList() {
    return this.http.get<any>("/api/Pharmacy?reqType=getprescriptionlist", this.options);
  }
  //GET: Prescription Items list by PatientId && ProviderId for sale purpose
  public GetPrescriptionItems(PatientId: number, ProviderId: number) {
    try {
      return this.http.get<any>("/api/Pharmacy?reqType=getPrescriptionItems&patientId=" + PatientId + "&providerId=" + ProviderId, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }

  //GET: Get all Sale invoice data list
  public GetSaleInvoiceList(fromDate, toDate, dispensaryId) {
    try {
      return this.http.get<any>(`/api/Pharmacy?reqType=getsaleinvoicelist&FromDate=${fromDate}&ToDate=${toDate}&DispensaryId=${dispensaryId}`, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }

  //GET: Get all Sale invoice data list
  public GetSaleReturnList(fromDate, toDate, dispensaryId) {
    try {
      return this.http.get<any>(`/api/Pharmacy?reqType=getsalereturnlist&FromDate=${fromDate}&ToDate=${toDate}&DispensaryId=${dispensaryId}`, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }




  //GET: Get sale invoice items details by Invoice id
  public GetSaleInvoiceItemsByInvoiceId(invoiceid: number) {
    try {
      return this.http.get<any>("/api/Pharmacy?reqType=getsaleinvoiceitemsbyid&invoiceid=" + invoiceid, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  //GET: Get sale return invoice items details by Invoice id
  public GetSaleInvoiceRetItemsByInvoiceId(invoiceid: number) {
    try {
      return this.http.get<any>("/api/Pharmacy?reqType=getsaleinvoiceretitemsbyid&invoiceid=" + invoiceid, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  //GET: Get sale return invoice items details by InvoiceReturnId
  public GetSaleReturnInvoiceItemsByInvoiceRetId(invoiceretid: number) {
    try {
      return this.http.get<any>("/api/Pharmacy?reqType=getsalereturninvoiceitemsbyid&invoiceretid=" + invoiceretid, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  //GET: Get GR Items as Stock details by ItemId 
  //Only get GR Items details with fullfill condition => AvailableQty > 0   
  public GetGRItemsByItemId(ItemId) {
    try {
      return this.http.get<any>("/api/Pharmacy?reqType=getGRItemsByItemId&itemId=" + ItemId, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  //GET: Get ReturnFromCustomer Invoice Model data for Return from customer functionality fulfill
  //passing Invoice Id and getting InvoiceReturnItemsModel
  //this for return from customer to pharmacy                
  public GetReturnFromCustomerModelDataByInvoiceId(InvoiceId: number, fiscYrId, storeId: number) {
    try {
      return this.http.get<any>("/api/Pharmacy?reqType=getReturnFromCustDataModelByInvId&invoiceId=" + InvoiceId + "&FiscalYearId=" + fiscYrId + "&storeId=" + storeId, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  public GetAllFiscalYears() {
    return this.http.get<any>("/api/Billing?reqType=all-fiscalYears");
  }

  public GetCreditOrganization() {
    return this.http.get<any>("/api/Pharmacy?reqType=get-credit-organizations");
  }
  //
  //GET: Patient - Patient Details by Patient Id (one patient details)
  public GetPatientByPatId(patientId: number) {
    try {
      return this.http.get<any>("/api/Pharmacy?reqType=getPatientByPatId&patientId=" + patientId, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  ////Get: Supplier Information List For Reporting
  public GetSupplierInformationReportList() {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMSupplierInformationReport", this.options);
    }
    catch (ex) { throw ex; }

  }

  ////Get: Get All Patient List BAsed on PAtient Type
  public GetInOutPatientDetails(value) {
    try {
      return this.http.get<any>("/api/Pharmacy?reqType=getInOutPatientDetails&IsOutdoorPat=" + value, this.options);
    }
    catch (ex) { throw ex; }

  }
  ////Get: Get All Credit Report For In/OUT Patient 
  public GetCreditInOutPatReportList(phrmReports, IsInOutPat, patientName) {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMCreditInOutPatReport?FromDate="
        + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate + "&IsInOutPat=" + IsInOutPat + "&patientName=" + patientName, this.options);
    }
    catch (ex) { throw ex; }

  }

  ////Get: Get Stock Item Report Data
  public GetStockItemsReport(itemId, location) {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMStockItemsReport?itemId=" + itemId + "&location=" + location, this.options);
    }
    catch (ex) { throw ex; }

  }

  //// Get: Get ABC/VDE Report Data
  public GetABCVDEReport(itemName) {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMStockItemsReport?ItemName=" + itemName, this.options);
    }
    catch (ex) { throw ex; }

  }
  ////Get: ////Get: Get Supplier Stock Summary Report Data
  public GetSupplierStockSummaryReport(supplierName) {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMSupplierStockSummaryReport?SupplierName=" + supplierName, this.options);
    }
    catch (ex) { throw ex; }

  }

  ////Get:  Get Batch Stock Report Data
  public GetBatchStockReport(itemName) {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMBatchStockReport?ItemName=" + itemName, this.options);
    }
    catch (ex) { throw ex; }

  }
  ////Get:  Get Expiry Report Data
  public GetExpiryReport(itemId, storeId, fromDate, toDate) {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMExpiryStockReport?ItemId=" + itemId + " &StoreId=" + storeId + "&FromDate=" + fromDate + "&ToDate=" + toDate, this.options);
    }
    catch (ex) { throw ex; }

  }
  ////Get:  Get Minimum Stock Report Data
  public GetMinStockReport(itemName) {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMMinStockReport?ItemName=" + itemName, this.options);
    }
    catch (ex) { throw ex; }

  }
  ////Get:  Get Batch Stock Report Data
  public GetPharmacyBillingReport(phrmReports, invoiceNumber) {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMBillingReport?FromDate="
        + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate + "&InvoiceNumber=" + invoiceNumber, this.options);
    }
    catch (ex) { throw ex; }

  }
  ////Get:  Get Rack Stock Distribution
  public GetRackStockDistributionReport(rackIds: string, locationId: number) {
    try {
      return this.http.get<any>(`/PharmacyReport/PHRMRackStockDistributionReport?RackIds=${rackIds}&LocationId=${locationId}`, this.options);
    }
    catch (ex) { throw ex; }

  }
  ////Get:  Get Batch Stock Report Data
  public GetStockMovementReport(itemName) {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMStockMovementReport?ItemName=" + itemName, this.options);
    }
    catch (ex) { throw ex; }

  }

  ////Get:  Get Supplier Stock Report Data
  public GetSupplierStockReport(fromDate, toDate, supplierId) {
    try {
      return this.http.get<any>(`/PharmacyReport/PHRMSupplierStockReport?FromDate=${fromDate}&ToDate=${toDate}&SupplierId=${supplierId}`, this.options);
    }
    catch (ex) { throw ex; }

  }
  //GET:  Get DateWise Purcahase Report Data
  public GetDateWisePurchaseReport(fromDate, toDate, supplierId) {
    try {
      return this.http.get<any>(`/PharmacyReport/PHRMDateWisePurchaseReport?FromDate=${fromDate}&ToDate=${toDate}&supplierId=${supplierId}`, this.options);
    }
    catch (ex) { throw ex; }

  }
  ////Get:  Get Ending Stock Summary Report Data
  public GetEndingStockSummaryReport(itemName) {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMEndingStockSummaryReport?ItemName=" + itemName, this.options);
    }
    catch (ex) { throw ex; }

  }

  //Get: Store Stock Item List
  public GetStoreRequestedItemList(Status) {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMStoreStock?Status=" + Status, this.options);
    }
    catch (ex) { throw ex; }
  }
  //GET: Dispensary List
  public GetDispensaryList() {
    try {
      return this.http.get<any>("/api/Pharmacy?reqType=getDispenaryList", this.options);
    }
    catch (ex) { throw ex; }
  }

  ////Get:  Get Daily Stock Summary Report Data
  public GetDailyStockSummaryReport(phrmReports) {
    try {
      return this.http.get<any>("/PharmacyReport/PHRMDailyStockSummaryReport?FromDate=" + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options);
    }
    catch (ex) { throw ex; }

  }
  ////Get:  Get  Stock Summary Report Data
  public GetStockSummaryReport(phrmReports) {
    try {
      return this.http.get<any>(`/PharmacyReport/PHRMStockSummaryReport?FromDate=${phrmReports.FromDate}&ToDate=${phrmReports.ToDate}&FiscalYearId=${phrmReports.FiscalYearId}&StoreId=${phrmReports.StoreId}`, this.options);
    }
    catch (ex) { throw ex; }
  }
  ////Get:  Item Wise Transaction Stock Summary Report Data
  public GetItemTxnSummaryReport(fromDate: string, toDate: string, itemId: number) {
    try {
      return this.http.get<any>(`/PharmacyReport/PHRMItemTxnSummaryReport?FromDate=${fromDate}&ToDate=${toDate}&Itemid=${itemId}`, this.options);
    }
    catch (ex) { throw ex; }
  }

  ////Get:  Get Daily Sales Summary Report Data
  //public GetDailySalesSummaryReport(fromDate, currentDate, itemName) {
  //    try {
  //        return this.http.get<any>("/PharmacyReport/PHRMDailySalesSummaryReport?FromDate=" + fromDate + "&CurrentDate=" + currentDate + "&ItemName=" + itemName, this.options);
  //    }
  //    catch (ex) { throw ex; }

  //}

  //GET: Get Stock Txn Items
  public GetStockTxnItems() {
    try {
      return this.http.get<any>("/api/Pharmacy?reqType=getStockTxnItemList", this.options);
    }
    catch (ex) { throw ex; }
  }


  // GET: Stock Details with 0, null or > 0 Quantity
  //this stock details with all unique (by ItemId,ExpiryDate,BatchNo)  records with sum of Quantity
  //items with 0 quantity or more than 0 showing in list
  public GetAllItemsStockDetailsList(dispensaryId) {
    return this.http.get<any>("/api/Pharmacy?reqType=allItemsStockDetails&DispensaryId=" + dispensaryId);
  }

  //Get ward stock details
  public GetWardStockDetailsList() {
    return this.http.get<any>("/api/Pharmacy?reqType=phrm-stock");
  }
  // GET: Stock Details with 0, null or > 0 Quantity
  //this stock details with all unique (by ItemId,ExpiryDate,BatchNo)  records with sum of Quantity
  //items with 0 quantity or more than 0 showing in list
  public GetAllItemsStockList() {
    return this.http.get<any>("/api/Pharmacy?reqType=allItemsStock");
  }
  // get rack list
  public GetRackList() {
    return this.http.get<any>("/api/Pharmacy?reqType=getRackList");
  }
  //Get: Ward Request Item list
  public GetWardRequestedItemList(status: string) {
    return this.http.get<any>("/api/Pharmacy?reqType=get-ward-requested-items&status=" + status, this.options)
  }

  //get deposit record of patient
  public GetDepositFromPatient(patientId: number) {
    return this.http.get<any>("/api/Pharmacy?reqType=patAllDeposits" + "&patientId=" + patientId, this.options);
  }
  //Get pharmacy requisition list
  public GetItemwiseRequistionList() {
    return this.http.get<any>("/api/Pharmacy?reqType=itemwiseRequistionList", this.options);
  }
  //Get: Single Requisition Details (RequisitionItems) by RequisitionId for View
  public GetRequisitionItemsByRID(RequisitionId: number) {
    return this.http.get<any>('/api/Pharmacy?reqType=requisitionItemsForView&requisitionId=' + RequisitionId);
  }
  //GET: Get Requisition and Requisition Items with Stock Records for Dispatch Items
  public GetRequisitionDetailsForDispatch(RequisitionId: number) {
    return this.http.get<any>("/api/Pharmacy/GetRequisitionDetailsForDispatch/" + RequisitionId, this.options);
  }

  public GetDispatchDetails(RequisitionId: number) {
    return this.http.get<any>('/api/Pharmacy?reqType=dispatchview&requisitionId=' + RequisitionId);
  }
  public GetMainStoreIncomingStockById(DispatchId: number) {
    return this.http.get<any>(`/api/Pharmacy/GetMainStoreIncomingStockById/${DispatchId}`);
  }
  public GetDispatchItemByDispatchId(DispatchId: number) {
    return this.http.get<any>('/api/Pharmacy?reqType=dispatchviewbyDispatchId&DispatchId=' + DispatchId);
  }
  public GetTermsList(TermApplicationId: number) {
    return this.http.get<any>('/api/InventorySettings/GetTermsListByTermsApplicationId/' + TermApplicationId);
  }
  //POST : setting-supplier manage
  public PostSupplier(supplier) {
    let data = JSON.stringify(supplier);
    return this.http.post<any>("/api/Pharmacy?reqType=supplier", data, this.options);
  }
  //POST : setting-company manage
  public PostCompany(company) {
    let data = JSON.stringify(company);
    return this.http.post<any>("/api/Pharmacy?reqType=company", data, this.options);
  }
  //POST: setting-dispense add
  public PostDispensary(Dispensary) {
    let data = JSON.stringify(Dispensary);
    return this.http.post<any>("/api/Pharmacy?reqType=dispensary", data, this.options);
  }
  //POST : setting-category manage
  public PostCategory(category) {
    let data = JSON.stringify(category);
    return this.http.post<any>("/api/Pharmacy?reqType=category", data, this.options);
  }
  //POST : send SMS
  public sendSMS(text) {
    let data = JSON.stringify(text);
    return this.http.post<any>("/api/Pharmacy?reqType=sendsms", data, this.options);
  }
  //POST : setting-unit of measurement manage
  public PostUnitOfMeasurement(uom) {
    let data = JSON.stringify(uom);
    return this.http.post<any>("/api/Pharmacy?reqType=unitofmeasurement", data, this.options);
  }
  //POST : setting-item type manage
  public PostItemType(itemtype) {
    let data = JSON.stringify(itemtype)
    return this.http.post<any>("/api/Pharmacy?reqType=itemtype", data, this.options);
  }
  //POST : setting-item type manage
  public PostPackingType(packingtype) {
    let data = JSON.stringify(packingtype)
    return this.http.post<any>("/api/Pharmacy?reqType=packingtype", data, this.options);
  }
  //POST : setting-item manage
  public PostItem(item) {
    let data = JSON.stringify(item)
    return this.http.post<any>("/api/Pharmacy?reqType=item", data, this.options);
  }
  //POST : setting-tax manage
  public PostTAX(tax) {
    let data = JSON.stringify(tax)
    return this.http.post<any>("/api/Pharmacy?reqType=tax", data, this.options);
  }
  //POST : Generic Name
  public PostGenericName(genericName) {
    let data = JSON.stringify(genericName);
    return this.http.post<any>("/api/Pharmacy?reqType=genericName", data, this.options);
  }
  //POST : narcotic Record
  public PostNarcoticRecord(narcoticRecord) {
    let data = JSON.stringify(narcoticRecord);
    return this.http.post<any>("/api/Pharmacy?reqType=narcoticRecord", data, this.options);
  }

  //POST: Patient
  //POST: Outdoor Patient Registration post to server/controller/api
  public PostPatientRegister(patient) {
    try {
      let data = JSON.stringify(patient);
      return this.http.post<any>("/api/Pharmacy?reqType=outdoorPatRegistration", data, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  //POST: Save Purchase Order
  public PostToPurchaseOrder(PurchaseOrderObjString: string) {
    let data = PurchaseOrderObjString;
    return this.http.post<any>("/api/Pharmacy?reqType=PurchaseOrder", data, this.options);

  }
  //POST:Save Goods Receipt
  public PostToGoodReceipt(GoodReceiptVMObjString: string) {
    let data = GoodReceiptVMObjString;
    return this.http.post<any>("/api/Pharmacy?reqType=postGoodReceipt", data, this.options);
  }
  ////POST: Return To Supplier Items
  public PostReturnToSupplierItems(ReturnToSupplierObjString: string) {
    let data = ReturnToSupplierObjString;
    return this.http.post<any>("/api/Pharmacy?reqType=postReturnToSupplierItems", data, this.options);

  }





  ////POST: WriteOff and WriteOffItems
  public PostWriteOffItems(WriteOffObjString: string) {
    try {
      let data = WriteOffObjString;
      return this.http.post<any>("/api/Pharmacy?reqType=postWriteOffItems", data, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }



  //POST: Save Prescription with Prescription Items
  public PostPrescription(data: string) {
    return this.http.post<any>("/api/Pharmacy?reqType=postprescription", data, this.options);
  }

  //POST:
  public PostInvoiceDetails(data: string) {
    try {
      return this.http.post<any>("/api/Pharmacy/PostInvoice", data, this.optionJson);
    } catch (ex) {
      throw ex;
    }
  }
  public PostSalesCategoryDetails(data: string) {
    try {
      return this.http.post<any>("/api/Pharmacy?reqType=postsalescategorydetail", data, this.options);
    } catch (ex) {
      throw ex;
    }
  }

  public GetSalesCategoryList() {
    try {
      return this.http.get<any>("/api/Pharmacy?reqType=getsalescategorylist", this.options);
    } catch (ex) {
      throw ex;
    }
  }

  //POST:return from customer invoice data to post server
  public PostReturnFromCustomerData(data: string) {
    try {
      return this.http.post<any>("/api/Pharmacy/PostReturnFromCustomer", data, this.optionJson);
    } catch (ex) {
      throw ex;
    }
  }
  public postManualReturn(data: string) {
    try {
      return this.http.post<any>("/api/pharmacy/postManualReturn", data, this.optionJson);
    } catch (ex) {
      throw ex;
    }
  }

  //POST:update stockManage transaction
  //Post to StockManage table and post to stockTxnItem table 
  PostManagedStockDetails(data) {
    try {
      return this.http.post<any>("/api/Pharmacy?reqType=manage-stock-detail", data, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  public PostPharmacyOutPatient(patientObjString: string) {
    let data = patientObjString;
    return this.http.post<any>("/api/Patient?reqType=billing-out-patient", data, this.options);

  }
  //POST:update storeManage transaction
  //Post to StoreStock table
  PostManagedStoreDetails(data) {
    try {
      return this.http.post<any>("/api/Pharmacy?reqType=manage-store-detail", data, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  //POST: Post to credit organizations
  public PostCreditOrganization(creditOrganization) {
    let data = JSON.stringify(creditOrganization);
    return this.http.post<any>("/api/Pharmacy?reqType=post-credit-organizations", data, this.options);
  }
  //POST: transfer to Dispensary and update store stock
  TransferToDispensary(data) {
    try {
      return this.http.post<any>("/api/Pharmacy?reqType=transfer-to-dispensary", data, this.options);
    } catch (ex) {
      throw ex;
    }
  }
  //POST: transfer to Store and update Dispensary stock
  TransferToStore(data, StoreId) {
    try {
      return this.http.post<any>("/api/Pharmacy?reqType=transfer-to-store&storeId=" + StoreId, data, this.options);
    } catch (ex) {
      throw ex;
    }
  }
  //POST:update goods receipt cancelation
  //post to stock transaction items
  PostGoodsReceiptCancelDetail(goodsReceiptId: number, cancelRemarks: string) {
    try {
      return this.http.post<any>(`/api/Pharmacy?reqType=cancel-goods-receipt&goodsReceiptId=${goodsReceiptId}&CancelRemarks=${cancelRemarks}`, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  //Post drugs request data from nursing to pharmacy invoice item table.
  public PostProvisonalItems(requisitionObjString: string) {
    return this.http.post<any>("/api/Pharmacy?reqType=post-provisional-item", requisitionObjString, this.options);
  }

  public PostPharmacyDeposit(PHRMDepositModel: PHRMDepositModel) {
    let data = JSON.stringify(PHRMDepositModel);
    return this.http.post<any>("/api/Pharmacy?reqType=depositData", data, this.options);
  }
  //Post ward request data from ward supply to pharmacy
  public PostWardRequisitionItems(requisitionObjString: string) {
    return this.http.post<any>("/api/Pharmacy?reqType=post-ward-requesition-item", requisitionObjString, this.options);
  }
  //PUT:Setting-Stock Items Expiry Date and BatchNo change
  public UpdateStockExpiryDateandBatchNo(ExpiryDateandBatchNoUpdatedStock) {
    try {
      let data = JSON.stringify(ExpiryDateandBatchNoUpdatedStock);
      return this.http.put<any>("/api/Pharmacy/UpdateStockExpiryDateandBatchNo", data, this.optionJson);
    }
    catch (ex) {
      throw ex;
    }
  }
  //PUT : setting-supplier manage
  public PutSupplier(supplier) {
    let data = JSON.stringify(supplier);
    return this.http.put<any>("/api/Pharmacy?reqType=supplier", data, this.options);
  }
  //PUT: credit organizations
  public PutCreditOrganization(creditOrganization) {
    let data = JSON.stringify(creditOrganization);
    return this.http.put<any>("/api/Pharmacy?reqType=put-credit-organizations", data, this.options);
  }
  //PUT : setting-company manage
  public PutCompany(company) {
    let data = JSON.stringify(company);
    return this.http.put<any>("/api/Pharmacy?reqType=company", data, this.options);
  }
  //PUT : setting-dispensary manage
  public PutDispensary(dispensary) {
    let data = JSON.stringify(dispensary);
    return this.http.put<any>("/api/Pharmacy?reqType=dispensary", data, this.options);
  }
  //PUT : setting-category manage
  public PutCategory(category) {
    let data = JSON.stringify(category);
    return this.http.put<any>("/api/Pharmacy?reqType=category", data, this.options);
  }
  //PUT : setting-unit of measurement manage
  public PutUnitOfMeasurement(uom) {
    let data = JSON.stringify(uom);
    return this.http.put<any>("/api/Pharmacy?reqType=unitofmeasurement", data, this.options);
  }
  //PUT : setting-item type manage
  public PutItemType(itemtype) {
    let data = JSON.stringify(itemtype);
    return this.http.put<any>("/api/Pharmacy?reqType=itemtype", data, this.options);
  }
  //PUT : setting-packing type manage
  public PutPackingType(packingtype) {
    let data = JSON.stringify(packingtype);
    return this.http.put<any>("/api/Pharmacy?reqType=packingtype", data, this.options);
  }
  //PUT : setting-item  manage
  public PutItem(item) {
    let data = JSON.stringify(item);
    return this.http.put<any>("/api/Pharmacy?reqType=item", data, this.options);
  }

  //PUT : CCCharge value in parameter tbl
  public PutCCcharge(temp) {
    let data = JSON.stringify(temp)
    return this.http.put<any>("/api/Pharmacy?reqType=cccharge", data, this.options);
  }
  //PUT : setting-item type manage
  public PutTAX(tax) {
    let data = JSON.stringify(tax);
    return this.http.put<any>("/api/Pharmacy?reqType=tax", data, this.options);
  }
  //PUT GenericName
  public PutGenericName(genericName) {
    let data = JSON.stringify(genericName);
    return this.http.put<any>("/api/Pharmacy?reqType=genericName", data, this.options);
  }

  //PUT : Stock Manage
  PutStock(stkManage) {
    try {
      let data = JSON.stringify(stkManage);
      return this.http.put<any>("/api/Pharmacy?reqType=stockManage", data, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }

  //PUT: DepositPrintCount
  PutDepositPrintCount(depositdata) {
    let data = JSON.stringify(depositdata);
    return this.http.put<any>("/api/Pharmacy?reqType=updateDepositPrint", data, this.options);
  }

  //PUT: Sale -Payment of Credit Invoice Items
  putPayInvoiceItemsCredit(CreditPayData) {
    try {
      let data = JSON.stringify(CreditPayData);
      return this.http.put<any>("/api/Pharmacy?reqType=InvItemsCreditPay", data, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }

  //PUT: Setting- Stock Txn Items MRP change
  public UpdateStockMRP(MRPUpdatedStock) {
    try {
      let data = JSON.stringify(MRPUpdatedStock);
      return this.http.put<any>("/api/Pharmacy/UpdateStockMRP", data, this.optionJson);
    }
    catch (ex) {
      throw ex;
    }
  }

  //PUT: Update Goods Receipt
  public UpdateGoodsReceipt(GoodReceipt) {
    try {
      let data = JSON.stringify(GoodReceipt);
      return this.http.put<any>("/api/Pharmacy?reqType=updateGoodReceipt", data, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }



  ///Abhishek: 4Sept'18 -- for credit billing

  public GetAllCreditSummary(fromDate, toDate, dispensaryId) {
    return this.http.get<any>("/api/Pharmacy?reqType=listpatientunpaidtotal&FromDate=" + fromDate + "&ToDate=" + toDate + "&DispensaryId=" + dispensaryId);
  }
  //
  public GetAllProvisionalReturn(fromDate, toDate, dispensaryId) {
    return this.http.get<any>(`/api/Pharmacy?reqType=provisional-return-list&FromDate=${fromDate}&ToDate=${toDate}&DispensaryId=${dispensaryId}`, this.options);
  }
  // GetAllProvisionalReturnDuplicatePrint
  public GetAllProvisionalReturnDuplicatePrint(PatientId) {
    return this.http.get<any>("/api/Pharmacy?reqType=provisional-return-duplicate-print&patientId=" + PatientId);
  }

  public GetPatientCreditItems(patientId: number, storeId: number) {
    return this.http.get<any>("/api/Pharmacy?reqType=provisionalItemsByPatientId&patientId=" + patientId + "&DispensaryId=" + storeId);
  }
  public GetStoreRackNameByItemId(itemId: number) {
    return this.http.get<any>("/api/Rack/GetStoreRackNameByItemId/" + itemId);
  }

  //POST:
  public PostCreditItemsDetails(data: string, requisitionId: number) {
    try {
      return this.http.post<any>("/api/Pharmacy?reqType=postProvisional&requisitionId=" + requisitionId, data, this.options);
    } catch (ex) {
      throw ex;
    }
  }

  public AddInvoiceForCreditItems(data: string) {
    try {
      return this.http.post<any>("/api/Pharmacy?reqType=addInvoiceForCrItems", data, this.options);
    } catch (ex) {
      throw ex;
    }
  }
  public updateInvoiceForCreditItems(data: string) {
    try {
      return this.http.post<any>("/api/Pharmacy?reqType=updateInvoiceForCrItems", data, this.options);
    } catch (ex) {
      throw ex;
    }
  }

  // print to update the print count on billtransaction
  public PutPrintCount(printCount: number, invoiceNo: number) {
    return this.http.put<any>("/api/Pharmacy?reqType=UpdatePrintCountafterPrint" + "&PrintCount=" + printCount + "&invoiceNo=" + invoiceNo, this.options);
  }

  public PutAddItemToRack(itemId: number, dispensaryRackId: number, storeRackId: number) {
    return this.http.put<any>("/api/Pharmacy?reqType=add-Item-to-rack" + "&itemId=" + itemId + "&dispensaryRackId=" + dispensaryRackId + `&storeRackId=${storeRackId}`, this.options);
  }
  // for cancel the credit bill.
  public CancelCreditBill(creditItems: string) {
    try {
      let data = JSON.stringify(creditItems);
      return this.http.post<any>("/api/Pharmacy?reqType=cancelCreditItems", data, this.options);
    } catch (ex) {
      throw ex;
    }
  }

  public PostBillSettlement(settlementInfo) {
    let data = JSON.stringify(settlementInfo);
    //data = CommonFunctions.EncodeRequestDataString(data);
    return this.http.post<any>("/api/Pharmacy?reqType=postSettlementInvoice", data, this.options);

  }

  //Save Requisition
  public PostToRequisition(RequisitionObjString: string) {
    let data = RequisitionObjString;
    return this.http.post<any>("/api/Pharmacy?reqType=StoreRequisition", data, this.options);
  }
  //POST:Save dispatched Items to database
  public PostDispatch(dispatchItems) {
    return this.http.post<any>("/api/Pharmacy/PostStoreDispatch", dispatchItems, this.optionJson);
  }
  //Start: REGION: FOR BillSettlements APIS
  public PutSettlementPrintCount(settlmntId: number) {
    return this.http.put<any>("/api/Pharmacy?reqType=updateSettlementPrintCount&settlementId=" + settlmntId, this.options);
  }
  //Get pharmacy GR history
  public GetGoodReceiptHistory() {
    return this.http.get<any>("/api/Pharmacy/getGoodReceiptHistory", this.options);
  }
  public GetGRDetailsByGRId(goodsReceiptId: number, isGRCancelled) {
    return this.http.get<any>(`/api/Pharmacy/GetGRDetailsByGRId?GoodsReceiptId=${goodsReceiptId}&IsGRCancelled=${isGRCancelled}`, this.options);

  }
  public GetInvoiceReceiptByInvoiceId(invoiceId: number) {
    return this.http.get<any>(`/api/Pharmacy/GetInvoiceReceiptByInvoiceId/${invoiceId}`, this.options);
  }
  //POST Direct Dispatch
  public PostDirectDispatch(dispatchItems: any[]) {
    let data = JSON.stringify(dispatchItems);
    return this.http.post<any>("/api/Pharmacy/PostDirectDispatch", data, this.optionJson);
  }
  //get PHRM Items Rate History
  public getItemRateHistory() {
    return this.http.get<any>('/api/Pharmacy/getItemRateHistory', this.options);
  }
  public getMRPHistory() {
    return this.http.get<any>('/api/Pharmacy/getMRPHistory', this.options);
  }

  public GetSettlementSingleInvoicePreview(InvoiceId: number) {
    return this.http.get<any>("/api/Pharmacy?reqType=get-settlement-single-invoice-preview" + "&invoiceId=" + InvoiceId, this.options);
  }
}
