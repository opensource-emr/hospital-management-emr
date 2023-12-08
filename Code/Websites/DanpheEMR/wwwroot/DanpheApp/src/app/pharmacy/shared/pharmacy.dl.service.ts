import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { PHRMDepositModel } from '../../dispensary/dispensary-main/patient-main/patient-deposit-add/phrm-deposit.model';
import { InvoiceDetailToBeReturn } from '../../dispensary/dispensary-main/sales-main/sales-return/model/invoice-detail-tobe-return.model';
import { PHRMPatientConsumptionItem } from '../patient-consumption/shared/phrm-patient-consumption-item.model';
import { PHRMPatientConsumption } from '../patient-consumption/shared/phrm-patient-consumption.model';
import { PHRMPurchaseOrder } from './phrm-purchase-order.model';


@Injectable()
export class PharmacyDLService {
  public options = { headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' }) };
  public optionJson = { headers: new HttpHeaders({ 'Content-Type': 'application/json' }) };
  constructor(public http: HttpClient) {

  }
  public GetSettlementSummaryReport(FromDate, ToDate, StoreId) {
    return this.http.get<any>("/api/PharmacyReport/SetlementSummaryReport?FromDate="
      + FromDate + "&ToDate=" + ToDate + "&StoreId=" + StoreId, this.options)
  }
  public GetPatientWiseSettlementSummaryReport(FromDate, ToDate, PatientId) {
    return this.http.get<any>("/api/PharmacyReport/PatientWiseSettlementSummaryReport?FromDate="
      + FromDate + "&ToDate=" + ToDate + "&PatientId=" + PatientId, this.options)
  }

  public GetPHRMPendingBillsForSettlement(storeId, organizationId) {
    return this.http.get<any>(`/api/PharmacySettlement/PendingBills?storeId=${storeId}&organizationId=${organizationId}`);
  }
  public GetPHRMSettlements(storeId, FromDate, ToDate) {
    return this.http.get<any>("/api/PharmacySettlement/Settlements?storeId=" + storeId + "&FromDate=" + FromDate + "&Todate=" + ToDate);
  }
  // get pharmacy settlement duplicate records.
  public GetPHRMSettlementDuplicatePrints() {
    return this.http.get<any>("/api/PharmacySettlement/DuplicatePrints");
  }
  // get pharmacy settlement duplicate details using settlement id.
  public GetPHRMSettlementDuplicateDetails(settlementId) {
    return this.http.get<any>("/api/PharmacySettlement/SettlementDetail?settlementId=" + settlementId);
  }
  public GetCreditInvoicesByPatient(patientId: number, organizationId: number) {
    return this.http.get<any>("/api/PharmacySettlement/PatientUnpaidInvoices?patientId=" + patientId + "&organizationId=" + organizationId, this.options);
  }

  public GetPatientPastBillSummary(patientId: number) {
    return this.http.get<any>("/api/PharmacySales/PatientBillHistory?patientId=" + patientId, this.options);
  }

  public GetProvisionalItemsByPatientIdForSettle(patientId: number) {
    return this.http.get<any>("/api/PharmacySettlement/PatientProvisionalItems?patientId=" + patientId, this.options);
  }
  public GetCreditOrganizationList() {
    return this.http.get<any>("/api/PharmacySettings/CreditOrganizations");
  }
  //GET: setting-supplier manage : list of suppliers
  public GetSupplierList() {
    return this.http.get<any>("/api/PharmacySettings/ActiveSuppliers");
  }
  public GetAllSupplierList() {
    return this.http.get<any>("/api/PharmacySettings/Suppliers");
  }

  public GetCounter() {
    return this.http.get<any>('/api/PharmacySettings/Counters', this.options);
  }
  public ActivatePharmacyCounter(counterId: number, counterName: string) {
    return this.http.put<any>("/api/Security/ActivatePharmacyCounter?counterId=" + counterId + "&counterName=" + counterName, this.options);
  }
  public DeActivatePharmacyCounter() {
    return this.http.put<any>("/api/Security/DeactivatePharmacyCounter", this.options);
  }

  //GET: getting vendor accodring the vendorid
  public GetSupplierDetailsBySupplierId(supplierId: number) {
    return this.http.get<any>("/api/Pharmacy?reqType=SupplierDetails&supplierId=" + supplierId, this.options);
  }
  //GET: setting-itemtype manage : List of itemtypes
  public GetItemTypeList() {
    return this.http.get<any>('/api/PharmacySettings/ItemTypes', this.options);
  }
  //GET: setting-packingtype  : List of packingtypes
  public GetPackingTypeList() {
    return this.http.get<any>('/api/PharmacySettings/PackingTypes', this.options);
  }
  //GET: setting- item manage: list of itemtypes
  public GetItemTypeListManage() {
    return this.http.get<any>('/api/Pharmacy?reqType=GetItemType', this.options);
  }

  // //sud:2Feb'23--Use another dlFunction which is returning same data with same inputs
  //GET: List of ItemTypes with all Child Items Master data
  // public GetItemTypeListWithItems(dispensaryId?) {
  //   try {
  //     return this.http.get<any>('/api/PharmacySales/DispensaryAvailableStocksDetail?dispensaryId=' + dispensaryId, this.options);
  //   }
  //   catch (ex) {
  //     throw ex;
  //   }
  // }

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
    return this.http.get<any>("/api/PharmacySettings/Companies");
  }

  //GET: setting-category manage : list of categories
  public GetCategoryList() {
    return this.http.get<any>("/api/PharmacySettings/ItemCategories");
  }
  ///GET: get ItemList by ItemTypeId
  public GetItemListByItemTypeId(itemTypeId) {
    return this.http.get<any>("/api/PharmacySettings/ItemsByItemTypeId?itemTypeId=" + itemTypeId, this.options);
  }
  public GetStockForItemDispatch() {
    return this.http.get<any>("/api/Pharmacy/GetStockForItemDispatch");
  }


  //GET: setting-unit of measurement manage : list of unit of measurements
  public GetUnitOfMeasurementList() {
    return this.http.get<any>("/api/PharmacySettings/UnitOfMeasurements");
  }
  //GET: setting-item manage : list of items
  public GetItemList() {
    return this.http.get<any>("/api/PharmacySettings/ItemsWithAllDetails");
  }
  //Get Only Master Items
  public GetItemMasterList() {
    return this.http.get<any>("/api/PharmacySettings/Items");
  }
  //GET: Get Store Details
  public GetActiveStore() {
    return this.http.get<any>("/api/PharmacyReport/GetActiveStores");
  }
  //GET: setting-tax manage : list of tax
  public GetTAXList() {
    return this.http.get<any>("/api/PharmacySettings/Taxes");
  }
  public GetGenericList() {
    return this.http.get<any>("/api/PharmacySettings/Generics");
  }

  //GET:patient List from Patient controller
  public GetPatients(searchTxt: string = '', isInsurance: boolean = false) {
    // return this.http.get<any>("/api/Patient", this.options);
    return this.http.get<any>(`/api/PharmacySales/GetPatientList?SearchText=${searchTxt}&IsInsurance=${isInsurance}`, this.options);
  }
  public GetPatientsListForSaleItems(isInsurnaceDispensary) {
    return this.http.get<any>(`/api/PharmacySales/PharmacySalePatient?IsInsurance=${isInsurnaceDispensary}`, this.options);
  }
  //GET:deposit
  public GetDeposit() {
    return this.http.get<any>("", this.options);
  }
  //GET: Patient List with matching info like firstname, lastname and phone number for checking existed patient or not
  //This call to Visit Controller for code reuseability because this method logic written in Visit controller
  public GetExistedMatchingPatientList(firstName, lastName, phoneNumber) {
    try {
      return this.http.get<any>("/api/Patient/MatchingPatients?FirstName="
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
      return this.http.get<any>("/api/PharmacyStock/StockManage?itemId=" + ItemId, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }

  ///GET: POList by Passing Status
  public GetPHRMPurchaseOrderList(status: string, fromDate: string, toDate: string) {
    return this.http.get<any>(`/api/PharmacyPurchase/Orders?status=${status}&FromDate=${fromDate}&ToDate=${toDate}`, this.options)
  }
  ///GET: POItemsList By Passing PurchaseOrderId
  public GetPHRMPOItemsByPOId(purchaseOrderId) {
    return this.http.get<any>("/api/PharmacyPurchase/OrderInfo?PurchaseOrderId=" + purchaseOrderId, this.options)
  }

  //GET: Provisional Items List
  public GetPHRMProvisionalItemList(status: string) {
    return this.http.get<any>("/api/PharmacySales/ProvisionalDrugRequisitionsByStatus?status=" + status, this.options);
  }

  //GET: All Provisional Items List
  public GetAllPHRMProvisionalItemList() {
    return this.http.get<any>("/api/PharmacySales/AllProvisionalDrugRequisitions", this.options)
  }

  //GET: Requsted drug-list by patientId and VisitId (used in Emergency) --added by Anish 25 Feb Anish
  public GetAllDrugOrderOfERPatient(patientId: number, visitId: number) {
    return this.http.get<any>("/api/PharmacyStock/DrugOrders?patientId=" + patientId + "&visitId=" + visitId, this.options)
  }

  //GET: drigs Items List
  public GetPHRMDrugsItemList(requisitionId) {
    return this.http.get<any>("/api/PharmacyStock/DrugRequisitions?requisitionId=" + requisitionId, this.options)
  }

  // GET: drug dispatch list per nursing requisition
  public GetPHRMDrugDispatchList(requisitionId) {
    return this.http.get<any>("/api/PharmacyStock/DispatchedDrugItems?requisitionId=" + requisitionId, this.options)
  }

  ////GET: PhrmPurchaseOrderItems List for GR
  public GetPHRMPOItemsForGR(purchaseOrderId) {
    return this.http.get<any>(`/api/PharmacyPurchase/OrderItemsToGoodsReceipt?purchaseOrderId=${purchaseOrderId}`, this.options)
  }
  ///GET: Get Return To SupplierItem by ReturnToSupplierId
  public GetReturnDetailByRetSuppId(returnToSupplierId) {
    return this.http.get<any>(`/api/PharmacyPurchaseReturn/ReturnDetail?returnToSupplierId=${returnToSupplierId}`, this.options)
  }

  ///GET: Get Return To SupplierItem of Goodreceipt from GR
  public GetReturnToSupplierItemsofExistingGR() {
    // return this.http.get<any>("/api/Pharmacy?reqType=getReturnToSu=" + returnToSupplierId, this.options)
    return this.http.get<any>("/api/GetCreditNoteItems", this.options);
  }

  ///GET: Get Write Off Items By WriteOffId
  public GetWriteOffItemsByWriteOffId(writeOffId) {
    try {
      return this.http.get<any>("/api/PharmacyStock/WriteOff?writeOffId=" + writeOffId, this.options)
    }
    catch (ex) {
      throw ex;
    }
  }
  //GET: order-goods receipt list
  public GetGoodsReceiptList() {
    return this.http.get<any>("/api/PharmacyPurchase/GoodReceipts");
  }
  //Get GR List with Date Filtered
  GetDateFilteredGoodsReceiptList(fromDate: string, toDate: string) {
    return this.http.get<any>("/api/PharmacyPO/DateFilteredGoodsReceiptList?FromDate=" + fromDate + "&ToDate=" + toDate, this.optionJson);
  }

  public GetSuppliersLedgerInfo(FromDate, ToDate) {
    return this.http.get<any>(`/api/PharmacyPurchase/SuppliersLedgerInfo?fromDate=${FromDate}&toDate=${ToDate}`);
  }

  public GetEachAccountDetailsList(SupplierID, FromDate, ToDate) {
    return this.http.get<any>("/api/PharmacyPurchase/SupplierLedgerInfo?supplierId=" + SupplierID + "&FromDate=" + FromDate + "&ToDate=" + ToDate);
  }
  //Get : all the stroe list
  public GetMainStore() {
    return this.http.get<any>("/api/PharmacySettings/MainStore");
  }
  //Get : all the main store stock
  public GetMainStoreStock(showAllStock: boolean = false) {
    return this.http.get<any>(`/api/PharmacyStock/MainStoreStock?ShowAllStock=${showAllStock}`);
  }
  //Get : all the unconfirmed stock for main store
  public GetMainStoreIncomingStock() {
    return this.http.get<any>("/api/PharmacyStock/MainStoreIncomingStock", this.optionJson);
  }
  //receiveIncomingStock
  ReceiveIncomingStock(dispatchId: number, receivingRemarks: string) {
    var remarks = JSON.stringify(receivingRemarks);
    return this.http.put<any>(`/api/PharmacyStock/ReceiveIncomingStock?DispatchId=${dispatchId}`, remarks, this.optionJson);
  }
  ///GET: Return  To Supplier
  public GetGoodsReceiptsInfo(suppId?, grNo?, invcId?, fromDate?, toDate?) {
    return this.http.get<any>(`/api/PharmacyPurchaseReturn/GoodsReceiptsInfo?supplierId=${suppId}&grNo=${grNo}&invoiceNo=${invcId}&fromDate=${fromDate}&toDate=${toDate}`, this.options);
  }

  ///GET: Return Items To Supplier List
  public GetReturnedList(fromDate, toDate) {
    return this.http.get<any>(`/api/PharmacyPurchaseReturn/ReturnedList?fromDate=${fromDate}&toDate=${toDate}`, this.options);
  }

  ///////here
  //public GetPharmacyInvoiceDetailsByInvoiceId(invoiceId: number) {
  //    return this.http.get<any>("/api/Pharmacy?reqType=getInvoiceDetailsByInvoiceId" + "&invoiceId=" + invoiceId, this.options);
  //}

  //GET: WriteOff List With SUM of Toatal WriteOff Qty
  public GetWriteOffList() {
    try {
      return this.http.get<any>("/api/PharmacyStock/WriteOffs");
    }
    catch (ex) {
      throw ex;
    }
  }
  ////Get Stock Details List
  public GetDispensaryAvailabeStockDetails(dispensaryId?) {
    return this.http.get<any>('/api/PharmacySales/DispensaryAvailableStocksDetail?dispensaryId=' + dispensaryId, this.options);
  }

  public GetItemListFromStoreId(dispensaryId) {
    return this.http.get<any>("/api/PharmacySettings/ItemsByDispensaryId?dispensaryId=" + dispensaryId);
  }

  ////Get Narcotics Stock Details List(sales)
  public GetNarcoticsStockDetailsList() {
    return this.http.get<any>("/api/PharmacyStock/NarcoticsStock");
  }
  public GetSalesDetailsList() {
    return this.http.get<any>("/api/PharmacyStock/StockDetails");
  }

  // Get items List
  public GetItemsList() {
    return this.http.get<any>("/api/PharmacySettings/ItemsWithAllDetails");
  }
  // Get only the item Name List
  public getOnlyItemNameList() {
    return this.http.get<any>("/api/PharmacyReport/getOnlyItemNameList");
  }
  public getItemListForManualReturn() {
    return this.http.get<any>("/api/PharmacySalesReturn/ItemListForManualReturn");
  }
  public getAvailableBatchesByItemId(itemId: number) {
    return this.http.get<any>(`/api/PharmacyStock/AvailableBatchesByItemId?ItemId=${itemId}`);
  }
  //Get: Get Users for Return from Customer Report.

  public getPharmacyUsers() {
    return this.http.get<any>("/api/PharmacyReport/GetPharmacyUsersForReturnFromCustomerReport");
  }
  //GET: Get Return From Customer Report.
  public getReturnFromCustomerReport(userId, dispensaryId, fromDate, toDate) {
    try {
      return this.http.get<any>("/api/PharmacyReport/ReturnFromCustomerReport?fromDate=" + fromDate + "&toDate=" + toDate + "&userId=" + userId + "&dispensaryId=" + dispensaryId, this.options);
    }
    catch (ex) { throw ex; }

  }

  //GET: Get Sales Statement Report
  public getSalesStatementReport(fromDate, toDate) {
    try {
      return this.http.get<any>(`/api/PharmacyReport/SalesStatementReport?FromDate=${fromDate}&ToDate=${toDate}`, this.options);
    }
    catch (ex) { throw ex; }
  }

  //GET: Get Sales Summary
  public getSalesSummaryReport(fromDate, toDate) {
    try {
      return this.http.get<any>(`/api/PharmacyReport/SalesSummaryReport?FromDate=${fromDate}&ToDate=${toDate}`, this.options);
    }
    catch (ex) { throw ex; }
  }

  //GET: Get Purchase Summary
  public getPurchaseSummaryReport(fromDate, toDate) {
    try {
      return this.http.get<any>(`/api/PharmacyReport/PurchaseSummaryReport?FromDate=${fromDate}&ToDate=${toDate}`, this.options);
    }
    catch (ex) { throw ex; }
  }

  //GET: Get Purchase Summary
  public getStockSummarySecondReport(tillDate) {
    try {
      return this.http.get<any>(`/api/PharmacyReport/StockSummarySecondReport?TillDate=${tillDate}`, this.options);
    }
    catch (ex) { throw ex; }
  }

  //GET: Get Ins Patient Report
  public getInsPatientBimaReport(fromDate, toDate, counterId, userId, claimCode, nshiNumber) {
    try {
      return this.http.get<any>(`/api/PharmacyReport/InsurancePatientBimaReport?FromDate=${fromDate}&ToDate=${toDate}&CounterId=${counterId}&UserId=${userId}&ClaimCode=${claimCode}&NSHINumber=${nshiNumber}`, this.options);
    }
    catch (ex) { throw ex; }
  }

  //GET: Get Patient Sales Detail Report
  public getPatientSalesDetailReport(fromDate, toDate, patientId, counterId, userId, storeId) {
    try {
      return this.http.get<any>(`/api/PharmacyReport/PatientSalesDetailReport?FromDate=${fromDate}&ToDate=${toDate}&PatientId=${patientId}&CounterId=${counterId}&UserId=${userId}&StoreId=${storeId}`, this.options);
    }
    catch (ex) { throw ex; }
  }

  ////Get:  Get Daily Sales Summary Report Data test
  public GetDailySalesSummaryReport(FromDate, ToDate, itemId, storeId, counterId, userId) {
    try {
      return this.http.get<any>(`/api/PharmacyReport/PHRMDailySalesReport?FromDate=${FromDate}&ToDate=${ToDate}&itemId=${itemId}&storeId=${storeId}&CounterId=${counterId}&UserId=${userId}`, this.options);
    }
    catch (ex) { throw ex; }

  }
  //GET:  Get Item Wise Purchase Report Data
  public GetItemWisePurchaseReport(FromDate, ToDate, itemId, invoiceNo?, grNo?, supplierId?) {
    try {
      return this.http.get<any>("/api/PharmacyReport/PHRMItemWisePurchaseReport?FromDate=" + FromDate + "&ToDate=" + ToDate + "&itemId=" + itemId + "&invoiceNo=" + invoiceNo + "&grNo=" + grNo + "&supplierId=" + supplierId, this.options);
    }
    catch (ex) { throw ex; }

  }
  //GET:  Get Stock Transfers Report Data
  public getStockTransfersReport(FromDate, ToDate, itemId, sourceStoreId, targetStoreId, notReceivedStocks) {
    try {
      return this.http.get<any>("/api/PharmacyReport/PHRMStockTransfersReport?FromDate=" + FromDate + "&ToDate=" + ToDate + "&itemId=" + itemId + "&sourceStoreId=" + sourceStoreId + "&targetStoreId=" + targetStoreId + "&notReceivedStocks=" + notReceivedStocks, this.options);
    }
    catch (ex) { throw ex; }

  }
  //GET:  Get Supplier Wise Stock Report Data
  public getSupplierWiseStockReport(FromDate, ToDate, itemId, storeId, supplierId) {
    try {
      return this.http.get<any>("/api/PharmacyReport/PHRMSupplierWiseStockReport?FromDate=" + FromDate + "&ToDate=" + ToDate + "&itemId=" + itemId + "&storeId=" + storeId + "&supplierId=" + supplierId, this.options);
    }
    catch (ex) { throw ex; }

  }


  ///// get Daliy Salse Report for Narcotics Date
  public GetNarcoticsDailySalesReport(FromDate, ToDate, itemId, storeId) {
    try {
      return this.http.get<any>("/api/PharmacyReport/PHRMNarcoticsDailySalesReport?FromDate=" + FromDate + "&ToDate=" + ToDate + "&itemId=" + itemId + "&storeId=" + storeId, this.options);
    }
    catch (ex) { throw ex; }

  }


  ////Get:  Get ABCVED Summary Report Data test
  public GetPHRMABCVEDStockReport(Status) {
    try {
      return this.http.get<any>("/api/PharmacyReport/PHRMABCVEDStockReport?Status=" + Status, this.options);
    }
    catch (ex) { throw ex; }

  }
  //GET: order-goods receipt items-view by GR-Id
  public GetGRItemsByGRId(goodsReceiptId) {
    return this.http.get<any>(`/api/PharmacyPurchase/GoodsReceiptInfo?goodsReceiptId=${goodsReceiptId}`, this.options);
  }
  public GetGRRetItemsByGRId(goodsReceiptId, creditNotePrintId) {
    return this.http.get<any>(`/api/PharmacyPurchase/GoodsReceiptReturnInfo?goodsReceiptId=${goodsReceiptId}&creditNotePrintId=${creditNotePrintId}`, this.options);
  }
  //GET:purchase order-items -view by PO-ID
  public GetPODetailsByPOID(purchaseOrderId) {
    return this.http.get<any>(`/api/PharmacyPO/PODetailsByPOID?PurchaseOrderId=${purchaseOrderId}`, this.options);
  }
  //GET: order-goods receipt items-view by GR-Id
  public GetGRItemsForEdit(goodsReceiptId) {
    return this.http.get<any>("/api/PharmacyPurchase/GoodsReceiptForEdit?goodsReceiptId=" + goodsReceiptId, this.options);
  }
  ///GET: GetBatchNo List By ItemId
  // public GetBatchNoByItemId(ItemId) {
  //   try {
  //     return this.http.get<any>("/api/Pharmacy?reqType=getBatchNoByItemId&itemId=" + ItemId, this.options);
  //   }
  //   catch (ex) {
  //     throw ex;
  //   }
  // }
  // ///GET: Get Item Details By passing BatchNo
  // public GetItemDetailsByBatchNo(BatchNo, ItemId) {
  //   try {
  //     return this.http.get<any>("/api/Pharmacy?reqType=getItemDetailsByBatchNo&batchNo=" + BatchNo + "&ItemId=" + ItemId, this.options);
  //   }
  //   catch (ex) {
  //     throw ex;
  //   }
  // }
  ////GET: Get Purchase Order Report
  public GetPHRMPurchaseOrderReport(phrmReports) {
    return this.http.get<any>("/api/PharmacyReport/PHRMPurchaseOrderReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate + "&Status=" + phrmReports.Status, this.options)
  }

  ////GET: Get User Report
  public GetPHRMUserwiseCollectionReport(phrmReports) {
    return this.http.get<any>("/api/PharmacyReport/PHRMUserwiseCollectionReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate + "&CounterId=" + phrmReports.CounterId + "&CreatedBy=" + phrmReports.CreatedBy + "&StoreId=" + phrmReports.StoreId, this.options)
  }

  ////GET: Get Cash Collection Summary Report
  public GetPHRMCashCollectionSummaryReport(phrmReports) {
    return this.http.get<any>("/api/PharmacyReport/PHRMCashCollectionSummaryReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate + "&StoreId=" + phrmReports.StoreId, this.options)
  }

  ////GET: Get Sale Return Report
  public GetSaleReturnReport(phrmReports) {
    return this.http.get<any>("/api/PharmacyReport/PHRMSaleReturnReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options)
  }


  ////GET: Get Counterwise Report
  public GetPHRMCounterwiseCollectionReport(phrmReports) {
    return this.http.get<any>("/api/PharmacyReport/PHRMCounterwiseCollectionReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options)
  }

  ////GET: Get Breakage Items Details Report
  public GetPHRMBreakageItemReport(phrmReports) {
    return this.http.get<any>("/api/PharmacyReport/PHRMBreakageItemReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options)
  }

  ////GET: Get Return To Supplier Details Report
  public GetPHRMReturnToSupplierReport(phrmReports) {
    return this.http.get<any>("/api/PharmacyReport/PHRMReturnToSupplierReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options)
  }
  ////GET: Get Transer To Store Report
  public GetPHRMTransferToStoreReport(phrmReports) {
    return this.http.get<any>("/api/PharmacyReport/PHRMTransferToStoreReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options)
  }
  ////GET: Get Transer To Dispensary Report
  public GetPHRMTransferToDispensaryReport(phrmReports) {
    return this.http.get<any>("/api/PharmacyReport/PHRMTransferToDispensaryReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options)
  }

  ////GET: Get Goods Receipt Product Report
  public GetPHRMGoodsReceiptProductReport(phrmReports, itemId) {
    return this.http.get<any>("/api/PharmacyReport/PHRMGoodsReceiptProductReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate + "&ItemId=" + itemId, this.options)
  }

  ////GET:  Get Drug Category Wise Report
  public GetPHRMDrugCategoryWiseReport(phrmReports, category) {
    return this.http.get<any>("/api/PharmacyReport/PHRMDrugCategoryWiseReport?FromDate="
      + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate + "&category=" + category, this.options)
  }

  //GET : Get stock manage details report
  public GetPHRMStockManageDetailReport(phrmReports) {
    try {
      return this.http.get<any>("/api/PharmacyReport/StockManageReport?FromDate="
        + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options)
    }
    catch (ex) {
      throw ex;
    }

  }

  //Get : Get Deposit Balance Report
  public GetPHRMDepositBalanceReport() {
    try {
      return this.http.get<any>("/api/PharmacyReport/DepositBalanceReport", this.options)
    }
    catch (ex) {
      throw ex;
    }

  }


  ////GET: Get Itemwise stock Report
  public GetPHRMDispensaryStoreReport(phrmReports) {
    try {
      return this.http.get<any>("/api/PharmacyReport/PHRMDispensaryStoreStockReport?Status=" + phrmReports.Status, this.options)
    }
    catch (ex) {
      throw ex;
    }
  }
  ///Get Narcotics Items stock details for sales report
  public GetPHRMNarcoticsStoreReport() {
    try {
      return this.http.get<any>("/api/PharmacyReport/PHRMNarcoticsDispensaryStoreStockReport", this.options)
    }
    catch (ex) {
      throw ex;
    }
  }
  ////GET: GET ItemList For Return Function Whose Available Qty is greater then zero
  // public GetItemListWithTotalAvailableQty() {
  //   return this.http.get<any>("/api/PharmacyPurchaseReturn/PharmacyItemsWithTotalAvailableQuantity", this.options)
  // }
  //GET: Get all doctors list
  //we are taking employe
  public GetDoctorList() {
    return this.http.get<any>("/api/Master/AppointmentApplicableEmployees", this.options);
  }

  public GetPatientSummary(patientId: number, SchemeId?: number, PatientVisitId?: number) {
    return this.http.get<any>(`/api/PharmacySales/PatientBillingSummary?patientId=${patientId} &schemeId=${SchemeId}&patientVisitId=${PatientVisitId}`, this.options);
  }


  //GET: Prescription List group by PatientName, DoctorName and CreatedDate
  public GetPrescriptionList() {
    return this.http.get<any>("/api/PharmacyPrescription/PatientsPrescriptions", this.options);
  }
  //GET: Prescription Items list by PatientId && ProviderId for sale purpose
  public GetPrescriptionItems(PatientId: number, PrescriberId: number, PrescriptionId: number) {
    try {
      return this.http.get<any>(`/api/PharmacySales/PrescriptionItems?patientId=${PatientId}&prescriberId=${PrescriberId}&prescriptionId=${PrescriptionId}`, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }

  //GET: Get all Sale invoice data list
  public GetSaleInvoiceList(fromDate, toDate, dispensaryId) {
    try {
      return this.http.get<any>(`/api/PharmacySales/Invoices?fromDate=${fromDate}&toDate=${toDate}&dispensaryId=${dispensaryId}`, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }

  //GET: Get all Sale invoice data list
  public GetSaleReturnList(fromDate, toDate, dispensaryId) {
    try {
      return this.http.get<any>(`/api/PharmacySalesReturn/CreditNotes?fromDate=${fromDate}&toDate=${toDate}&dispensaryId=${dispensaryId}`, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }




  //GET: Get sale invoice items details by Invoice id
  public GetSaleInvoiceItemsByInvoiceId(invoiceId: number) {
    try {
      return this.http.get<any>("/api/PharmacySales/InvoiceItems?invoiceId=" + invoiceId, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  //GET: Get sale return invoice items details by Invoice id
  // public GetSaleInvoiceRetItemsByInvoiceId(invoiceid: number) {
  //   try {
  //     return this.http.get<any>("/api/PharmacySalesReturn/SaleInvoiceReturnItemsByInvoiceId?invoiceId=" + invoiceid, this.options);
  //   }
  //   catch (ex) {
  //     throw ex;
  //   }
  // }
  //GET: Get sale return invoice items details by InvoiceReturnId
  public GetSaleReturnInvoiceItemsByInvoiceRetId(invoiceretid: number) {
    try {
      return this.http.get<any>("/api/PharmacySalesReturn/CreditNoteInfo?invoiceReturnId=" + invoiceretid, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  //GET: Get GR Items as Stock details by ItemId
  //Only get GR Items details with fullfill condition => AvailableQty > 0
  public GetGRItemsByItemId(ItemId) {
    try {
      return this.http.get<any>(`/api/PharmacyPurchase/GoodsReceiptDetailsByItemId?itemId=${ItemId}`, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  //GET: Get ReturnFromCustomer Invoice Model data for Return from customer functionality fulfill
  //passing Invoice Id and getting InvoiceReturnItemsModel
  //this for return from customer to pharmacy
  public GetReturnFromCustomerModelDataByInvoiceId(InvoicePrintId: number, fiscYrId, storeId: number) {
    try {
      return this.http.get<any>(`/api/PharmacySalesReturn/InvoiceAndItemsDetailForReturn?invoicePrintId=${InvoicePrintId}&fiscalYearId=${fiscYrId}&storeId=${storeId}`, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  public GetAllFiscalYears() {
    return this.http.get<any>("/api/Billing/BillingFiscalYears");
  }

  public GetCreditOrganization() {
    return this.http.get<any>("/api/PharmacySettings/CreditOrganizations");
  }
  //
  //GET: Patient - Patient Details by Patient Id (one patient details)
  public GetPatientByPatId(patientId: number) {
    try {
      return this.http.get<any>("/api/PharmacySales/PatientInfo?patientId=" + patientId, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  ////Get: Supplier Information List For Reporting
  public GetSupplierInformationReportList() {
    try {
      return this.http.get<any>("/api/PharmacyReport/PHRMSupplierInformationReport", this.options);
    }
    catch (ex) { throw ex; }

  }

  ////Get: Get All Patient List BAsed on PAtient Type
  public GetInOutPatientDetails(value) {
    try {
      return this.http.get<any>("/api/PharmacyReport/InOutPatientDetails?isOutDoorPatient=" + value, this.options);
    }
    catch (ex) { throw ex; }

  }
  ////Get: Get All Credit Report For In/OUT Patient
  public GetCreditInOutPatReportList(phrmReports, IsInOutPat, patientName) {
    try {
      return this.http.get<any>("/api/PharmacyReport/PHRMCreditInOutPatReport?FromDate="
        + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate + "&IsInOutPat=" + IsInOutPat + "&patientName=" + patientName, this.options);
    }
    catch (ex) { throw ex; }

  }

  ////Get: Get Stock Item Report Data
  public GetStockItemsReport(itemId, location) {
    try {
      return this.http.get<any>("/api/PharmacyReport/PHRMStockItemsReport?itemId=" + itemId + "&location=" + location, this.options);
    }
    catch (ex) { throw ex; }

  }

  //// Get: Get ABC/VDE Report Data
  public GetABCVDEReport(itemName) {
    try {
      return this.http.get<any>("/api/PharmacyReport/PHRMStockItemsReport?ItemName=" + itemName, this.options);
    }
    catch (ex) { throw ex; }

  }
  ////Get: ////Get: Get Supplier Stock Summary Report Data
  public GetSupplierStockSummaryReport(supplierName) {
    try {
      return this.http.get<any>("/api/PharmacyReport/PHRMSupplierStockSummaryReport?SupplierName=" + supplierName, this.options);
    }
    catch (ex) { throw ex; }

  }

  ////Get:  Get Batch Stock Report Data
  public GetBatchStockReport(itemName) {
    try {
      return this.http.get<any>("/api/PharmacyReport/PHRMBatchStockReport?ItemName=" + itemName, this.options);
    }
    catch (ex) { throw ex; }

  }
  ////Get:  Get Expiry Report Data
  public GetExpiryReport(itemId, storeId, fromDate, toDate) {
    try {
      return this.http.get<any>("/api/PharmacyReport/PHRMExpiryStockReport?ItemId=" + itemId + " &StoreId=" + storeId + "&FromDate=" + fromDate + "&ToDate=" + toDate, this.options);
    }
    catch (ex) { throw ex; }

  }
  ////Get:  Get Minimum Stock Report Data
  public GetMinStockReport(itemName) {
    try {
      return this.http.get<any>("/api/PharmacyReport/PHRMMinStockReport?ItemName=" + itemName, this.options);
    }
    catch (ex) { throw ex; }

  }
  ////Get:  Get Batch Stock Report Data
  public GetPharmacyBillingReport(phrmReports, invoiceNumber) {
    try {
      return this.http.get<any>("/api/PharmacyReport/PHRMBillingReport?FromDate="
        + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate + "&InvoiceNumber=" + invoiceNumber, this.options);
    }
    catch (ex) { throw ex; }

  }
  ////Get:  Get Rack Stock Distribution
  public GetRackStockDistributionReport(rackIds: string, locationId: number) {
    try {
      return this.http.get<any>(`/api/PharmacyReport/PHRMRackStockDistributionReport?RackIds=${rackIds}&LocationId=${locationId}`, this.options);
    }
    catch (ex) { throw ex; }

  }
  ////Get:  Get Batch Stock Report Data
  public GetStockMovementReport(itemName) {
    try {
      return this.http.get<any>("/api/PharmacyReport/PHRMStockMovementReport?ItemName=" + itemName, this.options);
    }
    catch (ex) { throw ex; }

  }

  ////Get:  Get Supplier Stock Report Data
  public GetSupplierStockReport(fromDate, toDate, supplierId) {
    try {
      return this.http.get<any>(`/api/PharmacyReport/PHRMSupplierStockReport?FromDate=${fromDate}&ToDate=${toDate}&SupplierId=${supplierId}`, this.options);
    }
    catch (ex) { throw ex; }

  }
  //GET:  Get DateWise Purcahase Report Data
  public GetDateWisePurchaseReport(fromDate, toDate, supplierId) {
    try {
      return this.http.get<any>(`/api/PharmacyReport/PHRMDateWisePurchaseReport?FromDate=${fromDate}&ToDate=${toDate}&supplierId=${supplierId}`, this.options);
    }
    catch (ex) { throw ex; }

  }
  ////Get:  Get Ending Stock Summary Report Data
  public GetEndingStockSummaryReport(itemName) {
    try {
      return this.http.get<any>("/api/PharmacyReport/PHRMEndingStockSummaryReport?ItemName=" + itemName, this.options);
    }
    catch (ex) { throw ex; }

  }

  //Get: Store Stock Item List
  public GetStoreRequestedItemList(Status) {
    try {
      return this.http.get<any>("/api/PharmacyReport/PHRMStoreStock?Status=" + Status, this.options);
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
      return this.http.get<any>("/api/PharmacyReport/PHRMDailyStockSummaryReport?FromDate=" + phrmReports.FromDate + "&ToDate=" + phrmReports.ToDate, this.options);
    }
    catch (ex) { throw ex; }

  }
  ////Get:  Get  Stock Summary Report Data
  public GetStockSummaryReport(phrmReports) {
    try {
      return this.http.get<any>(`/api/PharmacyReport/PHRMStockSummaryReport?FromDate=${phrmReports.FromDate}&ToDate=${phrmReports.ToDate}&FiscalYearId=${phrmReports.FiscalYearId}&StoreId=${phrmReports.StoreId}`, this.options);
    }
    catch (ex) { throw ex; }
  }
  ////Get:  Item Wise Transaction Stock Summary Report Data
  public GetItemTxnSummaryReport(fromDate: string, toDate: string, itemId: number) {
    try {
      return this.http.get<any>(`/api/PharmacyReport/PHRMItemTxnSummaryReport?FromDate=${fromDate}&ToDate=${toDate}&Itemid=${itemId}`, this.options);
    }
    catch (ex) { throw ex; }
  }

  ////Get:  Get Daily Sales Summary Report Data
  //public GetDailySalesSummaryReport(fromDate, currentDate, itemName) {
  //    try {
  //        return this.http.get<any>("/api/PharmacyReport/PHRMDailySalesSummaryReport?FromDate=" + fromDate + "&CurrentDate=" + currentDate + "&ItemName=" + itemName, this.options);
  //    }
  //    catch (ex) { throw ex; }

  //}

  //GET: Get Stock Txn Items
  public GetStockTxnItems() {
    try {
      return this.http.get<any>("/api/PharmacyStock/StockTransactions", this.options);
    }
    catch (ex) { throw ex; }
  }


  // GET: Stock Details with 0, null or > 0 Quantity
  //this stock details with all unique (by ItemId,ExpiryDate,BatchNo)  records with sum of Quantity
  //items with 0 quantity or more than 0 showing in list
  public GetAllItemsStockDetailsList() {
    return this.http.get<any>("/api/PharmacyStock/AllStockDetails");
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
    return this.http.get<any>("/api/GetAllRack", this.options);;
  }
  //Get: Ward Request Item list
  public GetWardRequestedItemList(FromDate: string, ToDate: string) {
    return this.http.get<any>(`/api/PharmacyStock/WardRequisitions?FromDate=${FromDate}&ToDate=${ToDate}`, this.options)
  }

  //get deposit record of patient
  public GetDepositFromPatient(patientId: number) {
    return this.http.get<any>("/api/PharmacySales/PatientDeposits?patientId=" + patientId, this.options);
  }
  //Get pharmacy requisition list
  public GetItemwiseRequistionList() {
    return this.http.get<any>("/api/Pharmacy?reqType=itemwiseRequistionList", this.options);
  }
  //Get: Single Requisition Details (RequisitionItems) by RequisitionId for View
  public GetRequisitionItemsByRID(RequisitionId: number) {
    return this.http.get<any>('/api/PharmacyStock/RequsitionItems?requisitionId=' + RequisitionId);
  }
  //GET: Get Requisition and Requisition Items with Stock Records for Dispatch Items
  public GetRequisitionDetailsForDispatch(RequisitionId: number) {
    return this.http.get<any>(`/api/PharmacyStock/RequisitionDetailsForDispatch?RequisitionId=${RequisitionId}`, this.options);
  }

  public GetDispatchDetails(RequisitionId: number) {
    return this.http.get<any>('/api/PharmacyStock/DispatchDetail?requisitionId=' + RequisitionId);
  }
  public GetMainStoreIncomingStockById(DispatchId: number) {
    return this.http.get<any>(`/api/PharmacyStock/MainStoreIncomingStockById?DispatchId=${DispatchId}`);
  }
  public GetDispatchItemByDispatchId(DispatchId: number) {
    return this.http.get<any>('/api/PharmacyStock/Dispatch?DispatchId=' + DispatchId);
  }
  public GetTermsList(termsApplicationId: number) {
    return this.http.get<any>(`/api/InventorySettings/TermsListByTermsApplicationId?termsApplicationId=${termsApplicationId}`);
  }
  //POST : setting-supplier manage
  public PostSupplier(supplier) {
    let data = JSON.stringify(supplier);
    return this.http.post<any>("/api/PharmacySettings/Supplier", data, this.options);
  }
  //POST : setting-company manage
  public PostCompany(company) {
    let data = JSON.stringify(company);
    return this.http.post<any>("/api/PharmacySettings/Company", data, this.options);
  }
  //POST: setting-dispense add
  public PostDispensary(Dispensary) {
    let data = JSON.stringify(Dispensary);
    return this.http.post<any>("/api//PharmacySettings/Dispensary", data, this.options);
  }
  //POST : setting-category manage
  public PostCategory(category) {
    let data = JSON.stringify(category);
    return this.http.post<any>("/api/PharmacySettings/PharmacyCategory", data, this.options);
  }
  //POST : send SMS
  public sendSMS(text) {
    let data = JSON.stringify(text);
    return this.http.post<any>("/api/Pharmacy?reqType=sendsms", data, this.options);
  }
  //POST : setting-unit of measurement manage
  public PostUnitOfMeasurement(uom) {
    let data = JSON.stringify(uom);
    return this.http.post<any>("/api/PharmacySettings/UnitOfMeasurement", data, this.options);
  }
  //POST : setting-item type manage
  public PostItemType(itemtype) {
    let data = JSON.stringify(itemtype)
    return this.http.post<any>("/api/PharmacySettings/ItemType", data, this.options);
  }
  //POST : setting-item type manage
  public PostPackingType(packingtype) {
    let data = JSON.stringify(packingtype)
    return this.http.post<any>("/api/PharmacySettings/PackingType", data, this.options);
  }
  //POST : setting-item manage
  public PostItem(item) {
    let data = JSON.stringify(item)
    return this.http.post<any>("/api/PharmacySettings/Item", data, this.options);
  }
  //POST : setting-tax manage
  public PostTAX(tax) {
    let data = JSON.stringify(tax)
    return this.http.post<any>("/api/PharmacySettings/Tax", data, this.options);
  }
  //POST : Generic Name
  public PostGenericName(genericName) {
    let data = JSON.stringify(genericName);
    return this.http.post<any>("/api/PharmacySettings/Generic", data, this.options);
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
      return this.http.post<any>("/api/PharmacySales/OutdoorPatient", data, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  //POST: Save Purchase Order
  public PostToPurchaseOrder(PurchaseOrderObjString: PHRMPurchaseOrder) {
    //let data = PurchaseOrderObjString;
    return this.http.post<any>("/api/PharmacyPurchase/Order", PurchaseOrderObjString, this.optionJson);

  }
  public UpdatePurchaseOrder(purchaseOrder: PHRMPurchaseOrder) {

    return this.http.put("/api/PharmacyPurchase/Order", purchaseOrder, this.optionJson);

  }
  //POST:Save Goods Receipt
  public PostToGoodReceipt(GoodReceiptVMObjString: string) {
    let data = GoodReceiptVMObjString;
    return this.http.post<any>("/api/PharmacyPurchase/GoodsReceipt", data, this.options);
  }
  ////POST: Return To Supplier Items
  public PostReturnToSupplierItems(ReturnToSupplierObjString: string) {
    let data = ReturnToSupplierObjString;
    return this.http.post<any>("/api/PharmacyPurchaseReturn/NewReturnDetail", data, this.options);

  }





  ////POST: WriteOff and WriteOffItems
  public PostWriteOffItems(WriteOffObjString: string) {
    try {
      let data = WriteOffObjString;
      return this.http.post<any>("/api/PharmacyStock/WriteOff", data, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }



  //POST: Save Prescription with Prescription Items
  public PostPrescription(data: string) {
    return this.http.post<any>("/api/PharmacyPrescription/NewPrescription", data, this.options);
  }

  //POST:
  public PostInvoiceDetails(data: string) {
    try {
      return this.http.post<any>("/api/PharmacySales/Invoice", data, this.optionJson);
    } catch (ex) {
      throw ex;
    }
  }
  public PostSalesCategoryDetails(data: string) {
    try {
      return this.http.post<any>("/api/PharmacySettings/SalesCategory", data, this.options);
    } catch (ex) {
      throw ex;
    }
  }

  public GetSalesCategoryList() {
    try {
      return this.http.get<any>("/api/PharmacySettings/SalesCategories", this.options);
    } catch (ex) {
      throw ex;
    }
  }

  //POST:return from customer invoice data to post server
  public PostReturnFromCustomerData(data: string) {
    try {
      return this.http.post<any>("/api/PharmacySalesReturn/ReturnFromCustomer", data, this.optionJson);
    } catch (ex) {
      throw ex;
    }
  }
  public postManualReturn(data: string) {
    try {
      return this.http.post<any>("/api/PharmacySalesReturn/ManualReturn", data, this.optionJson);
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
      return this.http.post<any>("/api/PharmacyStock/ManageStore", data, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  //POST: Post to credit organizations
  public PostCreditOrganization(creditOrganization) {
    let data = JSON.stringify(creditOrganization);
    return this.http.post<any>("/api/PharmacySettings/CreditOrganization", data, this.options);
  }
  //POST: transfer to Dispensary and update store stock
  TransferToDispensary(data) {
    try {
      return this.http.post<any>("/api/PharmacyStock/TransferToDispensary", data, this.options);
    } catch (ex) {
      throw ex;
    }
  }
  //POST: transfer to Store and update Dispensary stock
  TransferToStore(data, StoreId) {
    try {
      return this.http.post<any>("/api/PharmacyStock/TransferToStore?storeId=" + StoreId, data, this.options);
    } catch (ex) {
      throw ex;
    }
  }
  //POST:update goods receipt cancelation
  //post to stock transaction items
  PostGoodsReceiptCancelDetail(goodsReceiptId: number, cancelRemarks: string) {
    try {
      return this.http.post<any>(`/api/PharmacyPurchase/GoodsReceiptCancel?goodsReceiptId=${goodsReceiptId}&cancelRemarks=${cancelRemarks}`, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }
  //Post drugs request data from nursing to pharmacy invoice item table.
  public PostProvisonalItems(requisitionObjString: string) {
    return this.http.post<any>("/api/PharmacySales/DrugRequisitions_NotImplemented", requisitionObjString, this.options);
  }

  public PostPharmacyDeposit(PHRMDepositModel: PHRMDepositModel) {
    let data = JSON.stringify(PHRMDepositModel);
    return this.http.post<any>("/api/PharmacySales/Deposit", data, this.options);
  }
  //Post ward request data from ward supply to pharmacy
  public PostWardRequisitionItems(requisitionObjString: string) {
    return this.http.post<any>("/api/Pharmacy?reqType=post-ward-requesition-item", requisitionObjString, this.options);
  }
  //PUT:Setting-Stock Items Expiry Date and BatchNo change
  public UpdateStockExpiryDateandBatchNo(ExpiryDateandBatchNoUpdatedStock) {
    try {
      let data = JSON.stringify(ExpiryDateandBatchNoUpdatedStock);
      return this.http.put<any>("/api/PharmacyStock/StockExpiryDateandBatchNo", data, this.optionJson);
    }
    catch (ex) {
      throw ex;
    }
  }
  //PUT : setting-supplier manage
  public PutSupplier(supplier) {
    let data = JSON.stringify(supplier);
    return this.http.put<any>("/api/PharmacySettings/Supplier", data, this.options);
  }
  //PUT: credit organizations
  public PutCreditOrganization(creditOrganization) {
    let data = JSON.stringify(creditOrganization);
    return this.http.put<any>("/api/PharmacySettings/CreditOrganization", data, this.options);
  }
  //PUT : setting-company manage
  public PutCompany(company) {
    let data = JSON.stringify(company);
    return this.http.put<any>("/api/PharmacySettings/Company", data, this.options);
  }
  //PUT : setting-dispensary manage
  public PutDispensary(dispensary) {
    let data = JSON.stringify(dispensary);
    return this.http.put<any>("/api/PharmacySettings/Dispensary", data, this.options);
  }
  //PUT : setting-category manage
  public PutCategory(category) {
    let data = JSON.stringify(category);
    return this.http.put<any>("/api/PharmacySettings/Category", data, this.options);
  }
  //PUT : setting-unit of measurement manage
  public PutUnitOfMeasurement(uom) {
    let data = JSON.stringify(uom);
    return this.http.put<any>("/api/PharmacySettings/UnitOfMeasurement", data, this.options);
  }
  //PUT : setting-item type manage
  public PutItemType(itemtype) {
    let data = JSON.stringify(itemtype);
    return this.http.put<any>("/api/PharmacySettings/ItemType", data, this.options);
  }
  //PUT : setting-packing type manage
  public PutPackingType(packingtype) {
    let data = JSON.stringify(packingtype);
    return this.http.put<any>("/api/PharmacySettings/PackingType", data, this.options);
  }
  //PUT : setting-item  manage
  public PutItem(item) {
    let data = JSON.stringify(item);
    return this.http.put<any>("/api/PharmacySettings/Item", data, this.options);
  }

  //PUT : CCCharge value in parameter tbl
  public PutCCcharge(temp) {
    let data = JSON.stringify(temp)
    return this.http.put<any>("/api/PharmacySettings/CCCharge", data, this.options);
  }
  //PUT : setting-item type manage
  public PutTAX(tax) {
    let data = JSON.stringify(tax);
    return this.http.put<any>("/api/PharmacySettings/Tax", data, this.options);
  }
  //PUT GenericName
  public PutGenericName(genericName) {
    let data = JSON.stringify(genericName);
    return this.http.put<any>("/api/PharmacySettings/Generic", data, this.options);
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
    return this.http.put<any>("/api/PharmacySales/DepositPrintCount", data, this.options);
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

  //PUT: Setting- Stock Txn Items SalePrice change
  public UpdateStockMRP(MRPUpdatedStock) {
    try {
      let data = JSON.stringify(MRPUpdatedStock);
      return this.http.put<any>("/api/PharmacyStock/StockMRP", data, this.optionJson);
    }
    catch (ex) {
      throw ex;
    }
  }

  //PUT: Update Goods Receipt
  public UpdateGoodsReceipt(GoodReceipt) {
    try {
      let data = JSON.stringify(GoodReceipt);
      return this.http.put<any>("/api/PharmacyPurchase/GoodsReceipt", data, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }



  ///Abhishek: 4Sept'18 -- for credit billing

  public GetAllCreditSummary(fromDate, toDate, dispensaryId) {
    return this.http.get<any>("/api/PharmacySales/PatientsProvisionalInfo?fromDate=" + fromDate + "&toDate=" + toDate + "&dispensaryId=" + dispensaryId);
  }
  //
  public GetAllProvisionalReturn(fromDate, toDate, dispensaryId) {
    return this.http.get<any>(`/api/PharmacySalesReturn/ProvisionalReturns?fromDate=${fromDate}&toDate=${toDate}&dispensaryId=${dispensaryId}`, this.options);
  }
  // GetAllProvisionalReturnDuplicatePrint
  public GetAllProvisionalReturnDuplicatePrint(PatientId) {
    return this.http.get<any>("/api/PharmacySalesReturn/PatientProvisionalReturnItems?patientId=" + PatientId);
  }

  public GetPatientCreditItems(patientId: number, storeId: number, PatientVisitId?: number) {
    return this.http.get<any>(`/api/PharmacySales/PatientProvisionaItems?patientId=${patientId}&dispensaryId=${storeId}&patientVisitId=${PatientVisitId}`);
  }
  public GetStoreRackNameByItemId(itemId: number) {
    return this.http.get<any>("/api/Rack/GetStoreRackNameByItemId/" + itemId);
  }

  //POST:
  public PostCreditItemsDetails(data: string, requisitionId: number) {
    try {
      return this.http.post<any>("/api/PharmacySales/ProvisionalItems?requisitionId=" + requisitionId, data, this.options);
    } catch (ex) {
      throw ex;
    }
  }

  public AddInvoiceForCreditItems(data: string) {
    try {
      return this.http.post<any>("/api/PharmacySales/FinalInvoiceFromProvisional", data, this.optionJson);
    } catch (ex) {
      throw ex;
    }
  }
  public updateInvoiceForCreditItems(data: string) {
    try {
      return this.http.put<any>("/api/PharmacySales/ProvisionalInvoice", data, this.optionJson);
    } catch (ex) {
      throw ex;
    }
  }

  // print to update the print count on billtransaction
  public PutPrintCount(printCount: number, invoiceId: number) {
    return this.http.put<any>(`/api/PharmacySales/InvoicePrintCount?printCount=${printCount}&invoiceId=${invoiceId}`, this.options);
  }

  public PutAddItemToRack(itemId: number, dispensaryRackId: number, storeRackId: number) {
    return this.http.put<any>(`/api/PharmacySettings/ItemToRack?itemId=${itemId}&dispensaryRackId=${dispensaryRackId}&storeRackId=${storeRackId}`, this.options);
  }
  // for cancel the credit bill.
  public CancelCreditBill(creditItems: string) {
    try {
      let data = JSON.stringify(creditItems);
      return this.http.put<any>("/api/PharmacySales/CancelProvisionalInvoice", data, this.optionJson);
    } catch (ex) {
      throw ex;
    }
  }

  public PostBillSettlement(settlementInfo) {
    return this.http.post<any>("/api/PharmacySettlement/NewSettlement", settlementInfo, this.optionJson);

  }

  //Save Requisition
  public PostToRequisition(RequisitionObjString: string) {
    let data = RequisitionObjString;
    return this.http.post<any>("/api/Pharmacy?reqType=StoreRequisition", data, this.options);
  }
  //POST:Save dispatched Items to database
  public PostDispatch(dispatchItems) {
    return this.http.post<any>("/api/PharmacyStock/StoreDispatch", dispatchItems, this.optionJson);
  }
  //Start: REGION: FOR BillSettlements APIS
  public PutSettlementPrintCount(settlmntId: number) {
    return this.http.put<any>("/api/PharmacySettlement/PrintCount?settlementId=" + settlmntId, this.options);
  }
  //Get pharmacy GR history
  public GetGoodReceiptHistory() {
    return this.http.get<any>("/api/PharmacyPO/GoodsReceiptHistory", this.options);
  }
  public GetGRDetailsByGRId(goodsReceiptId: number, isGRCancelled) {
    return this.http.get<any>(`/api/PharmacyPO/GRDetailsByGRId?GoodsReceiptId=${goodsReceiptId}&IsGRCancelled=${isGRCancelled}`, this.options);

  }
  public GetInvoiceReceiptByInvoiceId(invoiceId: number) {
    return this.http.get<any>(`/api/PharmacySales/InvoiceReceiptByInvoiceId?InvoiceId=${invoiceId}`, this.options);
  }
  //POST Direct Dispatch
  public PostDirectDispatch(dispatchItems: any[]) {
    let data = JSON.stringify(dispatchItems);
    return this.http.post<any>("/api/PharmacyStock/DirectDispatch", data, this.optionJson);
  }
  //get PHRM Items Rate History
  public getItemRateHistory() {
    return this.http.get<any>('/api/PharmacyPO/ItemRateHistory', this.options);
  }
  public getMRPHistory() {
    return this.http.get<any>('/api/PharmacyPO/MRPHistory', this.options);
  }
  public FreeQuantityHistory() {
    return this.http.get<any>('/api/PharmacyPO/ItemFreeQuantityReceivedHistory', this.options);
  }

  public GetSettlementSingleInvoicePreview(InvoiceId: number) {
    return this.http.get<any>("/api/PharmacySettlement/PreviewInvoice?invoiceId=" + InvoiceId, this.options);
  }
  public GetGRDetailWithAvailableStock(goodsReceiptId) {
    return this.http.get<any>(`/api/PharmacyPurchaseReturn/GRDetailWithAvailableStock?goodsReceiptId=${goodsReceiptId}`, this.options);
  }
  ExportStocksForReconciliationToExcel() {
    return this.http.get(`/api/PharmacyStock/ExportStocksForReconciliationToExcel`, { responseType: 'blob' });
  }
  UpdateReconciledStockFromExcelFile(data: any) {
    try {
      return this.http.post<any>("/api/PharmacySettings/UpdateReconciledStockFromExcelFile", data, this.options);
    } catch (ex) {
      throw ex;
    }
  }
  ///// get Return On Investment Report
  public GetReturnOnInvestmentReport(FromDate, ToDate) {
    try {
      return this.http.get<any>("/api/PharmacyReport/GetReturnOnInvestmentReport?FromDate=" + FromDate + "&ToDate=" + ToDate, this.options);
    }
    catch (ex) { throw ex; }

  }

  //PUT : Update NMC No
  UpdateNMCNo(EmployeeId, MedCertificationNo) {
    try {
      return this.http.put<any>(`/api/PharmacySettings/NMCNo?EmployeeId=${EmployeeId}`, MedCertificationNo, this.optionJson);
    }
    catch (ex) {
      throw ex;
    }
  }
  GetPaymentWiseReportData(fromDate: string, toDate: string, PaymentMode: string, Type: string, UserId: number, StoreId: number) {
    return this.http.get<any>("/api/PharmacyReport/PHRM_PaymentModeWiseReport?FromDate=" + fromDate + "&ToDate=" + toDate + "&PaymentMode=" + PaymentMode + "&Type=" + Type + "&User=" + UserId + "&StoreId=" + StoreId)
  }
  AddPriceCategory(rowToAdd: any) {
    return this.http.post<any>("/api/PharmacySettings/PriceCategory", rowToAdd, this.optionJson);
  }
  UpdatePriceCategory(rowToAdd: any) {
    return this.http.put<any>("/api/PharmacySettings/PriceCategory", rowToAdd, this.optionJson);
  }

  public GetPharmacyDashboardCardSummaryCalculation(FromDate, ToDate) {
    try {
      return this.http.get<any>("/PharmacyDashboard/GetPharmacyDashboardCardSummaryCalculation?FromDate=" + FromDate + "&ToDate=" + ToDate, this.options);
    }
    catch (ex) { throw ex; }

  }
  public GetPharmacyDashboardSubstoreWiseDispatchValue(FromDate, ToDate) {
    try {
      return this.http.get<any>("/PharmacyDashboard/GetPharmacyDashboardSubstoreWiseDispatchValue?FromDate=" + FromDate + "&ToDate=" + ToDate, this.options);
    }
    catch (ex) { throw ex; }

  }

  public GetPharmacyDashboardMembershipWiseMedicineSale(FromDate, ToDate) {
    try {
      return this.http.get<any>("/PharmacyDashboard/GetPharmacyDashboardMembershipWiseMedicineSale?FromDate=" + FromDate + "&ToDate=" + ToDate, this.options);
    }
    catch (ex) { throw ex; }

  }

  public GetPharmacyDashboardMostSoldMedicine(FromDate, ToDate) {
    try {
      return this.http.get<any>("/PharmacyDashboard/GetPharmacyDashboardMostSoldMedicine?FromDate=" + FromDate + "&ToDate=" + ToDate, this.options);
    }
    catch (ex) { throw ex; }

  }
  GetRankMembershipwiseSalesData(fromDate: string, toDate: string, rank: string, membership: string) {
    return this.http.get<any>("/api/PharmacyReport/RankMembershipwiseSalesReport?FromDate=" + fromDate + "&ToDate=" + toDate + "&rank=" + rank + "&membership=" + membership)

  }
  public GetAllMembership() {
    return this.http.get<any>('/api/PharmacyReport/GetAllMembership', this.options);
  }
  public GetAllRankList() {
    return this.http.get<any>('/api/Visit/GetRank', this.options);
  }
  GetPriceCategories() {
    return this.http.get<any>("/api/Master/GetPriceCategories");
  }
  public IsClaimed(latestClaimCode: number, patientId: number) {
    return this.http.get<any>(`/api/SSF/CheckClaimStatusLocally?latestClaimCode=${latestClaimCode}&patientId=${patientId}`, this.optionJson);
  }
  public PostSubStoreDispatch(dispatchItems) {
    return this.http.post("/api/PharmacyStock/SubStoreDispatch", dispatchItems, this.optionJson);
  }
  public GetFiscalYearList() {
    return this.http.get("/api/PharmacySettings/FiscalYearList");
  }
  GetAllPharmacyStore() {
    return this.http.get<any>("/api/PharmacySettings/PharmacyStores");
  }
  public GetParentRackList() {
    return this.http.get<any>("/api/GetParentRack", this.options);
  }
  public AddItemToRack(data: any[]) {
    let dataitem = JSON.stringify(data)
    return this.http.post<any>("/api/Rack/PHRM_MAP_ItemToRack", data, this.optionJson);
  }
  public GetAllRackItem(storeId, ItemId) {
    return this.http.get<any>("/api/PharmacyRack/GetRackItem?StoreId=" + storeId + "&ItemId=" + ItemId, this.options);
  }
  public GetItemRackAllocationData(ItemId?: number) {
    return this.http.get(`/api/Rack/GetItemRackData/${ItemId}`, this.options);
  }
  public GetAllRackList() {
    return this.http.get("/api/GetRackList", this.options);
  }
  public GetRackNoByItemIdAndStoreId(ItemId, StoreId?: number) {
    return this.http.get(`/api/PharmacySettings/RackNoByItemIdAndStoreId?ItemId=${ItemId}&StoreId=${StoreId}`, this.options);
  }
  public PostItemToRack(data: any[]) {
    let dataitem = JSON.stringify(data)
    return this.http.post<any>("/api/Rack/PostPHRM_MAP_ItemToRack", data, this.optionJson);
  }
  public GetReturnFromCustomerModelDataByHospitalNo(HospitalNo: string, PaymentMode: string, FromDate: string, ToDate: string, StoreId: number, SchemeId: number) {
    try {
      return this.http.get<any>(`/api/PharmacySalesReturn/MultipleInvoiceItemsToReturn?HospitalNo=${HospitalNo}&PaymentMode=${PaymentMode}&FromDate=${FromDate}&ToDate=${ToDate}&StoreId=${StoreId}&SchemeId=${SchemeId}`, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }

  public PostMultipleInvoiceItemReturnFromCustomer(InvoiceToBeReturn: InvoiceDetailToBeReturn) {
    try {
      return this.http.post("/api/PharmacySalesReturn/ReturnMultipleInvoiceItemsFromCustomer", InvoiceToBeReturn, this.optionJson);
    }
    catch (ex) {
      throw ex
    }
  }
  public GetMultipleInvoiceItemsReturnDetailFromCustomerByInvoiceReturnId(InvoiceReturnId: number) {
    return this.http.get(`/api/PharmacySalesReturn/ReceiptDetailToPrintMultipleInvoiceReturn?InvoiceReturnId=${InvoiceReturnId}`);
  }
  public PostPatientConsumption(patientConsumption: PHRMPatientConsumption) {
    try {
      return this.http.post<any>("/api/PatientConsumption/PharmacyPatientConsumption", patientConsumption, this.optionJson);
    }
    catch (ex) {
      throw ex
    }
  }
  public GetPatientConsumptions() {
    try {
      return this.http.get<any>("/api/PatientConsumption/PatientConsumptions", this.options);

    }
    catch (ex) {
      throw ex

    }

  }
  public PostPatientConsumptionInvoiceItems(PatientConsumptionfinalInvoice: PHRMPatientConsumption) {
    try {
      return this.http.post<any>("/api/PatientConsumption/FinalInvoiceForConsumption", PatientConsumptionfinalInvoice, this.optionJson);

    }
    catch (ex) {
      throw ex

    }
  }

  public GetPatientConsumptionForReturn(patientId: number, patientVisitId: number) {
    try {
      return this.http.get<any>(`/api/PatientConsumption/PatientConsumptionInfo?patientId=${patientId}&patientVisitId=${patientVisitId}`, this.options);

    }
    catch (ex) {
      throw ex

    }
  }

  public SavePatientConsumptionReturn(ConsumptionItem: Array<PHRMPatientConsumptionItem>) {
    try {
      return this.http.post(`/api/PatientConsumption/Return`, ConsumptionItem, this.optionJson);

    }
    catch (ex) {
      throw ex

    }
  }
  public GetPatientConsumptionReturnList() {
    try {
      return this.http.get(`/api/PatientConsumption/Returns`, this.options);

    }
    catch (ex) {
      throw ex

    }
  }

  public GetPatientConsumptionReturnInfo(ConsumptionReturnReceiptNo: number) {
    try {
      return this.http.get(`/api/PatientConsumption/ReturnInfo?consumptionReturnReceiptNo=${ConsumptionReturnReceiptNo}`, this.options);

    }
    catch (ex) {
      throw ex

    }
  }
  public GetFinalizePatientConsumptions() {
    try {
      return this.http.get(`/api/PatientConsumption/FinalizedConsumptions`, this.options);
    }
    catch (ex) {
      throw ex

    }
  }
  public GetPatientConsumptionFinalizeInvoice(InvoicePrintNo: number) {
    try {
      return this.http.get<any>(`/api/PatientConsumption/FinalizedConsumption?InvoicePrintNo=${InvoicePrintNo}`, this.options);

    }
    catch (ex) {
      throw ex

    }
  }
  public GetVerifiers() {
    return this.http.get(`/api/PharmacyPurchase/Verifiers`, this.options);
  }

  public GetStores() {
    return this.http.get(`/api/PharmacySettings/Stores`, this.options);
  }

  public GetDispensaryAvailableStock(dispensaryId: number, priceCategoryId?: number) {
    return this.http.get<any>(`/api/PharmacySales/DispensaryAvailableStock?dispensaryId=${dispensaryId}&priceCategoryId=${priceCategoryId}`, this.options);
  }

  public GetPatientConsumptionInfo(patientConsumptionId: number) {
    try {
      return this.http.get<any>(`/api/PatientConsumption/ConsumptionInfo?patientConsumptionId=${patientConsumptionId}`, this.options);
    }
    catch (ex) {
      throw ex
    }
  }

  public GetPatientConsumptionsOfPatient(PatientId: number, PatientVisitId: number) {
    return this.http.get(`/api/PatientConsumption/ConsumptionsOfPatient?patientId=${PatientId}&patientVisitId=${PatientVisitId}`, this.options);
  }

  public GetWardSubStoreMapDetails(WardId: number) {
    return this.http.get(`/api/PatientConsumption/WardSubStoreMapInfo?wardId=${WardId}`, this.options);
  }
  public GetPatientConsumptionsOfNursingWard(StoreIds: string) {
    return this.http.get(`/api/PatientConsumption/PatientConsumptionsOfNursing?storeIds=${StoreIds}`, this.options);
  }
  public GetPatientConsumptionsFromNursingWard(PatientId: number, PatientVisitId: number, StoreIds: string) {
    return this.http.get(`/api/PatientConsumption/ConsumptionsOfPatientFromNursing?patientId=${PatientId}&patientVisitId=${PatientVisitId}&storeIds=${StoreIds}`, this.options);
  }
  public GetPharmacyIpBillingScheme(SchemeId: number) {
    return this.http.get(`/api/PatientConsumption/PharmacyIpBillingScheme?schemeId=${SchemeId}`, this.options);
  }
  public GetSubStores() {
    return this.http.get(`/api/PharmacySettings/SubStores`, this.options);
  }

  public GetItemWiseWardSupplyReport(FromDate: string, ToDate: string, WardId: number, ItemId: number) {
    return this.http.get(`/api/PharmacyReport/ItemWiseWardSupplyReport?fromDate=${FromDate}&toDate=${ToDate}&wardId=${WardId}&itemId=${ItemId}`, this.options);
  }
  public GetDefaultScheme(ServiceBillingContext: string) {
    return this.http.get(`/api/BillingMaster/Schemes?serviceBillingContext=${ServiceBillingContext}`, this.options);
  }
  public GetPharmacyItems() {
    return this.http.get(`/api/PharmacyPurchase/Items`, this.options);
  }


  public SaveProvisional(provisionalItems) {
    try {
      return this.http.post(`/api/PharmacySales/ProvisionalInvoice`, provisionalItems, this.optionJson);
    }
    catch (ex) {
      throw ex
    }
  }

  public GetProvisionalReturnReceipt(ReturnReceiptNo: number) {
    return this.http.get(`/api/PharmacySales/ProvisionalReturnInfo?returnReceiptNo=${ReturnReceiptNo}`, this.options);
  }
  public GetProvisionalReturns(FromDate: string, ToDate: string, StoreId: number) {
    return this.http.get(`/api/PharmacySalesReturn/ProvisionalReturns?fromDate=${FromDate}&toDate=${ToDate}&storeId=${StoreId}`, this.options);
  }

  public UpdatePrescriptionItemStatus(PatientId: number) {
    try {
      return this.http.put<any>(`/api/PharmacySales/UpdatePrescriptionOrderStatus?patientId=${PatientId}`, this.options);
    }
    catch (ex) {
      throw ex;
    }
  }

}
